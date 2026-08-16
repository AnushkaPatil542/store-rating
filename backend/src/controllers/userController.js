
const bcrypt = require("bcryptjs");
const { Store, User, Rating } = require("../models");
const { Op } = require("sequelize");

// =====================================================
// GET ALL STORES
// Search + Sort + Average Rating + My Rating + Pagination
// =====================================================

const getStores = async (req, res) => {
    try {
        const { search, sort } = req.query;

        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            parseInt(req.query.limit) || 10,
            50
        );

        const where = {};

        // Search by store name or address
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
                }
            ];
        }

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

        const result = stores.map((store) => {
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
                    ? myRating.rating
                    : null
            };
        });

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

        const total = result.length;

        const startIndex =
            (page - 1) * limit;

        const paginatedStores =
            result.slice(
                startIndex,
                startIndex + limit
            );

        const totalPages =
            Math.ceil(total / limit);

        return res.status(200).json({
            count: paginatedStores.length,
            total,
            page,
            limit,
            totalPages,
            stores: paginatedStores
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
                message: "Rating must be a number"
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

        const store =
            await Store.findByPk(storeId);

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
                message: "Rating must be a number"
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


// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        // Required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message:
                    "Current password and new password are required"
            });
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters with at least one uppercase letter and one special character"
            });
        }

        // Get logged-in user
        const user =
            await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Verify current password
        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                message:
                    "Current password is incorrect"
            });
        }

        // Prevent same password
        const samePassword =
            await bcrypt.compare(
                newPassword,
                user.password
            );

        if (samePassword) {
            return res.status(400).json({
                message:
                    "New password must be different from current password"
            });
        }

        // Hash new password
        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            message:
                "Password updated successfully"
        });

    } catch (error) {
        console.error(
            "Change password error:",
            error
        );

        return res.status(500).json({
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
    updateRating,
    changePassword
};

