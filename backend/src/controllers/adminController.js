const { User, Store, Rating } = require("../models");

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalStores = await Store.count();
        const totalRatings = await Rating.count();

        res.status(200).json({
            totalUsers,
            totalStores,
            totalRatings
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const { search, role, sort } = req.query;

        const where = {};

        // Search by name, email or address
        if (search) {
            const { Op } = require("sequelize");

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

        // Filter by role
        if (role) {
            where.role = role;
        }

        let order = [["createdAt", "DESC"]];

        if (sort === "name") {
            order = [["name", "ASC"]];
        }

        if (sort === "email") {
            order = [["email", "ASC"]];
        }

        const users = await User.findAll({
            where,
            attributes: [
                "id",
                "name",
                "email",
                "address",
                "role",
                "createdAt"
            ],
            order
        });

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            address,
            role
        } = req.body;

        // Required fields
        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Validate role
        const allowedRoles = ["USER", "STORE_OWNER", "ADMIN"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Check duplicate email
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const bcrypt = require("bcryptjs");

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            address,
            role
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getDashboardStats,
    getAllUsers,createUser
};