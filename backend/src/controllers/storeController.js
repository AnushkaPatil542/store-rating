const { Store, User, Rating } = require("../models");
const { Op } = require("sequelize");

const createStore = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            ownerId
        } = req.body;

        // Required fields
        if (!name || !email || !address || !ownerId) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check owner exists
        const owner = await User.findOne({
            where: {
                id: ownerId,
                role: "STORE_OWNER"
            }
        });

        if (!owner) {
            return res.status(404).json({
                message: "Store owner not found"
            });
        }

        // Check duplicate store email
        const existingStore = await Store.findOne({
            where: { email }
        });

        if (existingStore) {
            return res.status(409).json({
                message: "Store email already exists"
            });
        }

        // Create store
      const store = await Store.create({
    name,
    email,
    address,
    owner_id: ownerId
});

        res.status(201).json({
            message: "Store created successfully",
            store
        });

    } catch (error) {
        console.error("Create store error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getAllStores = async (req, res) => {
    try {
        const { search, sort } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    email: {
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

        let order = [["createdAt", "DESC"]];

        if (sort === "name") {
            order = [["name", "ASC"]];
        }

        if (sort === "email") {
            order = [["email", "ASC"]];
        }

        const stores = await Store.findAll({
            where,
            include: [
                {
                    model: User,
                    as: "owner",
                    attributes: [
                        "id",
                        "name",
                        "email"
                    ]
                }
            ],
            order
        });

        res.status(200).json({
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    createStore,
    getAllStores
};