const { Store, Rating, User } = require("../models");

const getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const store = await Store.findOne({
            where: {
                owner_id: ownerId
            },
            include: [
                {
                    model: Rating,
                    as: "ratings",
                    attributes: ["rating", "user_id"]
                }
            ]
        });

        if (!store) {
            return res.status(404).json({
                message: "Store not found for this owner"
            });
        }

        const ratings = store.ratings || [];

        const averageRating =
            ratings.length > 0
                ? ratings.reduce(
                    (sum, item) => sum + Number(item.rating),
                    0
                ) / ratings.length
                : 0;

        res.status(200).json({
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                averageRating: Number(
                    averageRating.toFixed(1)
                ),
                totalRatings: ratings.length
            }
        });

    } catch (error) {
        console.error("Owner dashboard error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getOwnerDashboard
};