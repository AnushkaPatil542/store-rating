const { Store, User, Rating } = require("../models");
const { Op } = require("sequelize");

// =====================================================
// GET ALL STORES
// Search + Sort + Average Rating + My Rating + Pagination
// =====================================================

const getStores = async (req, res) => {
    try {
        const { search, sort } = req.query;

        // Pagination
        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            parseInt(req.query.limit) || 10,
            50
        );

        const where = {};

        // Search by name, address or email
        if (search) {
            where[Op.or] = [
                {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    address: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    email: {
                        [Op.like]: `%${search}%`
                    }
                }
            ];
        }

        // Get stores
        const stores = await Store.findAll({
            where,
            include: [
                {
                    model: Rating,
                    as: "ratings",
                    attributes: ["rating", "user_id"]
                }
            ],
            order: [["name", "ASC"]]
        });

        // Prepare store data
        const result = stores.map(store => {

            const ratings = store.ratings || [];

            // Calculate average rating
            const averageRating =
                ratings.length > 0
                    ? ratings.reduce(
                        (sum, item) =>
                            sum + Number(item.rating),
                        0
                    ) / ratings.length
                    : 0;

            // Find current user's rating
            const myRating = ratings.find(
                item =>
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
                    ? myRating.rating
                    : null
            };
        });

        // =================================================
        // SORTING
        // =================================================

        if (sort === "name") {
            result.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        }

        if (sort === "rating") {
            result.sort(
                (a, b) =>
                    b.averageRating -
                    a.averageRating
            );
        }

        // =================================================
        // PAGINATION
        // =================================================

        const total = result.length;

        const startIndex = (page - 1) * limit;

        const paginatedStores = result.slice(
            startIndex,
            startIndex + limit
        );

        const totalPages = Math.ceil(
            total / limit
        );

        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({
            count: paginatedStores.length,
            total,
            page,
            limit,
            totalPages,
            stores: paginatedStores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
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

        // Rating required
        if (rating === undefined || rating === null) {
            return res.status(400).json({
                message: "Rating is required"
            });
        }

        // Rating must be a number
        if (typeof rating !== "number") {
            return res.status(400).json({
                message: "Rating must be a number"
            });
        }

        // Rating must be integer between 1 and 5
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

        // Check store exists
        const store = await Store.findByPk(storeId);

        if (!store) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // Check whether user already rated
        const existingRating = await Rating.findOne({
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

        // Create rating
        const newRating = await Rating.create({
            user_id: req.user.id,
            store_id: storeId,
            rating
        });

        res.status(201).json({
            message: "Rating submitted successfully",
            rating: newRating
        });

    } catch (error) {
        console.error(
            "Submit rating error:",
            error
        );

        res.status(500).json({
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

        // Rating required
        if (rating === undefined || rating === null) {
            return res.status(400).json({
                message: "Rating is required"
            });
        }

        // Rating must be a number
        if (typeof rating !== "number") {
            return res.status(400).json({
                message: "Rating must be a number"
            });
        }

        // Rating must be integer between 1 and 5
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

        // Find current user's rating
        const existingRating = await Rating.findOne({
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

        // Update rating
        existingRating.rating = rating;

        await existingRating.save();

        res.status(200).json({
            message: "Rating updated successfully",
            rating: existingRating
        });

    } catch (error) {
        console.error(
            "Update rating error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getStores,
    submitRating,
    updateRating
};