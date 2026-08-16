const {
    Store,
    Rating,
    User
} = require("../models");


// =====================================================
// GET OWNER DASHBOARD
// =====================================================

const getOwnerDashboard = async (req, res) => {
    try {

        const ownerId = req.user.id;

        // Find the store assigned to logged-in owner
        const store = await Store.findOne({
            where: {
                owner_id: ownerId
            }
        });

        if (!store) {
            return res.status(404).json({
                message:
                    "Store not found for this owner"
            });
        }


        // Find all ratings for this store
        const ratings =
            await Rating.findAll({
                where: {
                    store_id: store.id
                },
                attributes: [
                    "id",
                    "rating",
                    "user_id"
                ]
            });


        // Calculate average rating
        const averageRating =
            ratings.length > 0
                ? ratings.reduce(
                    (sum, item) =>
                        sum + Number(item.rating),
                    0
                ) / ratings.length
                : 0;


        // Get users who rated this store
        const userIds = [
            ...new Set(
                ratings.map(
                    (rating) =>
                        rating.user_id
                )
            )
        ];


        let users = [];

        if (userIds.length > 0) {

            const ratingUsers =
                await User.findAll({
                    where: {
                        id: userIds
                    },
                    attributes: [
                        "id",
                        "name",
                        "email",
                        "address"
                    ]
                });


            users = ratingUsers.map(
                (user) => {

                    const userRating =
                        ratings.find(
                            (rating) =>
                                Number(
                                    rating.user_id
                                ) ===
                                Number(user.id)
                        );

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        address: user.address,
                        rating: userRating
                            ? Number(
                                userRating.rating
                            )
                            : null
                    };
                }
            );
        }


        return res.status(200).json({

            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,

                averageRating:
                    Number(
                        averageRating.toFixed(1)
                    ),

                totalRatings:
                    ratings.length
            },

            users

        });

    } catch (error) {

        console.error(
            "Owner dashboard error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getOwnerDashboard
};