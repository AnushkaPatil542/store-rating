const { Store, User, Rating } = require("../models");
const { Op } = require("sequelize");

// =====================================================
// GET STORES
// Search + Sort + Pagination + Average Rating + My Rating
// =====================================================

const getStores = async (req, res) => {
    try {
        const {
            search = "",
            sort = "name",
            order = "asc",
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(Number(page), 1);
        const pageLimit = Math.min(
            Math.max(Number(limit), 1),
            100
        );

        const offset = (currentPage - 1) * pageLimit;

        const where = {};

        // Search by store name, address or email
        if (search.trim()) {
            where[Op.or] = [
                {
                    name: {
                        [Op.like]: `%${search.trim()}%`
                    }
                },
                {
                    address: {
                        [Op.like]: `%${search.trim()}%`
                    }
                },
                {
                    email: {
                        [Op.like]: `%${search.trim()}%`
                    }
                }
            ];
        }

        let sortField = "name";

        if (sort === "email") {
            sortField = "email";
        }

        if (sort === "address") {
            sortField = "address";
        }

        const sortOrder =
            order.toLowerCase() === "desc"
                ? "DESC"
                : "ASC";

        const { rows, count } = await Store.findAndCountAll({
            where,
            include: [
                {
                    model: Rating,
                    as: "ratings",
                    attributes: [
                        "rating",
                        "user_id"
                    ]
                }
            ],
            order: [
                [sortField, sortOrder]
            ],
            limit: pageLimit,
            offset
        });

        const stores = rows.map((store) => {

            const ratings = store.ratings || [];

            const averageRating =
                ratings.length > 0
                    ? ratings.reduce(
                        (sum, item) =>
                            sum + Number(item.rating),
                        0
                    ) / ratings.length
                    : 0;

            const myRating = ratings.find(
                (item) =>
                    Number(item.user_id) ===
                    Number(req.user.id)
            );

            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,

                averageRating: Number(
                    averageRating.toFixed(1)
                ),

                myRating: myRating
                    ? Number(myRating.rating)
                    : null,

                totalRatings: ratings.length
            };
        });

        return res.status(200).json({
            count,
            page: currentPage,
            limit: pageLimit,
            totalPages: Math.ceil(
                count / pageLimit
            ),
            stores
        });

    } catch (error) {
        console.error(
            "Get stores error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// CREATE STORE
// ADMIN ONLY
// =====================================================

const createStore = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            owner_id
        } = req.body;

        if (!name || !email || !address) {
            return res.status(400).json({
                message:
                    "Name, email and address are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email
            .trim()
            .toLowerCase();
        const cleanAddress = address.trim();

        // Name validation
        if (
            cleanName.length < 20 ||
            cleanName.length > 60
        ) {
            return res.status(400).json({
                message:
                    "Name must be between 20 and 60 characters"
            });
        }

        // Address validation
        if (cleanAddress.length > 400) {
            return res.status(400).json({
                message:
                    "Address must not exceed 400 characters"
            });
        }

        // Email validation
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Check duplicate store email
        const existingStore = await Store.findOne({
            where: {
                email: cleanEmail
            }
        });

        if (existingStore) {
            return res.status(409).json({
                message:
                    "Store with this email already exists"
            });
        }

        // If owner is provided, verify owner
        let ownerId = null;

        if (
            owner_id !== undefined &&
            owner_id !== null &&
            owner_id !== ""
        ) {
            const owner = await User.findOne({
                where: {
                    id: owner_id,
                    role: "STORE_OWNER"
                }
            });

            if (!owner) {
                return res.status(400).json({
                    message:
                        "Invalid store owner"
                });
            }

            ownerId = owner.id;
        }

        const store = await Store.create({
            name: cleanName,
            email: cleanEmail,
            address: cleanAddress,
            owner_id: ownerId
        });

        return res.status(201).json({
            message:
                "Store created successfully",
            store
        });

    } catch (error) {
        console.error(
            "Create store error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// SUBMIT RATING
// =====================================================

const submitRating = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { rating } = req.body;

        if (
            rating === undefined ||
            rating === null
        ) {
            return res.status(400).json({
                message: "Rating is required"
            });
        }

        if (typeof rating !== "number") {
            return res.status(400).json({
                message:
                    "Rating must be a number"
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                message:
                    "Rating must be an integer between 1 and 5"
            });
        }

        const store = await Store.findByPk(
            storeId
        );

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        const existingRating =
            await Rating.findOne({
                where: {
                    user_id: req.user.id,
                    store_id: storeId
                }
            });

        if (existingRating) {
            return res.status(409).json({
                message:
                    "You have already rated this store. Use update instead."
            });
        }

        const newRating =
            await Rating.create({
                user_id: req.user.id,
                store_id: storeId,
                rating
            });

        return res.status(201).json({
            message:
                "Rating submitted successfully",
            rating: newRating
        });

    } catch (error) {
        console.error(
            "Submit rating error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// UPDATE RATING
// =====================================================

const updateRating = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { rating } = req.body;

        if (
            rating === undefined ||
            rating === null
        ) {
            return res.status(400).json({
                message: "Rating is required"
            });
        }

        if (typeof rating !== "number") {
            return res.status(400).json({
                message:
                    "Rating must be a number"
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                message:
                    "Rating must be an integer between 1 and 5"
            });
        }

        const existingRating =
            await Rating.findOne({
                where: {
                    user_id: req.user.id,
                    store_id: storeId
                }
            });

        if (!existingRating) {
            return res.status(404).json({
                message:
                    "You have not rated this store yet"
            });
        }

        existingRating.rating = rating;

        await existingRating.save();

        return res.status(200).json({
            message:
                "Rating updated successfully",
            rating: existingRating
        });

    } catch (error) {
        console.error(
            "Update rating error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getStores,
    createStore,
    submitRating,
    updateRating
};