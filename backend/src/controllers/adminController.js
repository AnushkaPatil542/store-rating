
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { User, Store, Rating } = require("../models");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalStores = await Store.count();
        const totalRatings = await Rating.count();

        return res.status(200).json({
            totalUsers,
            totalStores,
            totalRatings
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET ALL USERS
// Filters: Name, Email, Address, Role
// =====================================================

const getAllUsers = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            role,
            search
        } = req.query;

        const where = {};

        // General search
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

        // Individual filters
        if (name) {
            where.name = {
                [Op.like]: `%${name}%`
            };
        }

        if (email) {
            where.email = {
                [Op.like]: `%${email}%`
            };
        }

        if (address) {
            where.address = {
                [Op.like]: `%${address}%`
            };
        }

        if (role) {
            where.role = role;
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

            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET USER DETAILS
// Store Owner -> show store rating
// =====================================================

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: [
                "id",
                "name",
                "email",
                "address",
                "role"
            ]
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        let rating = null;
        let store = null;

        // If user is Store Owner
        if (user.role === "STORE_OWNER") {

            store = await Store.findOne({
                where: {
                    owner_id: user.id
                }
            });

            if (store) {

                const ratings = await Rating.findAll({
                    where: {
                        store_id: store.id
                    },

                    attributes: [
                        "rating"
                    ]
                });

                if (ratings.length > 0) {

                    const total = ratings.reduce(
                        (sum, item) =>
                            sum + Number(item.rating),
                        0
                    );

                    rating = Number(
                        (total / ratings.length).toFixed(1)
                    );

                } else {
                    rating = 0;
                }
            }
        }

        return res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
                rating
            },

            store: store
                ? {
                    id: store.id,
                    name: store.name,
                    email: store.email,
                    address: store.address
                }
                : null
        });

    } catch (error) {
        console.error("Get user details error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// CREATE USER
// Admin can create USER, STORE_OWNER or ADMIN
// =====================================================

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            address,
            role
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !address ||
            !role
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
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

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters with at least one uppercase letter and one special character"
            });
        }

        // Allowed roles
        const allowedRoles = [
            "USER",
            "STORE_OWNER",
            "ADMIN"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Duplicate email
        const existingUser = await User.findOne({
            where: {
                email: cleanEmail
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            address: cleanAddress,
            role
        });

        return res.status(201).json({
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

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// GET ALL STORES
// Filters: Name, Email, Address
// =====================================================

const getAllStores = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            search
        } = req.query;

        const where = {};

        // General search
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

        // Individual filters
        if (name) {
            where.name = {
                [Op.like]: `%${name}%`
            };
        }

        if (email) {
            where.email = {
                [Op.like]: `%${email}%`
            };
        }

        if (address) {
            where.address = {
                [Op.like]: `%${address}%`
            };
        }

        const stores = await Store.findAll({
            where,

            order: [
                ["createdAt", "DESC"]
            ]
        });

        const storesWithRatings = await Promise.all(
            stores.map(async (store) => {

                const ratings = await Rating.findAll({
                    where: {
                        store_id: store.id
                    },

                    attributes: [
                        "rating"
                    ]
                });

                const totalRatings =
                    ratings.length;

                const averageRating =
                    totalRatings > 0
                        ? Number(
                            (
                                ratings.reduce(
                                    (sum, item) =>
                                        sum + Number(item.rating),
                                    0
                                ) / totalRatings
                            ).toFixed(1)
                        )
                        : 0;

                return {
                    id: store.id,
                    name: store.name,
                    email: store.email,
                    address: store.address,
                    owner_id: store.owner_id,
                    averageRating,
                    totalRatings
                };
            })
        );

        return res.status(200).json({
            count: storesWithRatings.length,
            stores: storesWithRatings
        });

    } catch (error) {
        console.error("Get stores error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// CREATE STORE
// =====================================================

const createStore = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            owner_id
        } = req.body;

        if (
            !name ||
            !email ||
            !address ||
            !owner_id
        ) {
            return res.status(400).json({
                message:
                    "Name, email, address and owner_id are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();

        // Store name validation
        if (
            cleanName.length < 1 ||
            cleanName.length > 60
        ) {
            return res.status(400).json({
                message:
                    "Store name must not exceed 60 characters"
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

        // Check owner
        const owner = await User.findOne({
            where: {
                id: owner_id,
                role: "STORE_OWNER"
            }
        });

        if (!owner) {
            return res.status(404).json({
                message: "Store owner not found"
            });
        }

        // One owner = one store
        const existingStore =
            await Store.findOne({
                where: {
                    owner_id
                }
            });

        if (existingStore) {
            return res.status(409).json({
                message:
                    "This store owner already has a store"
            });
        }

        // Create store
        const store =
            await Store.create({
                name: cleanName,
                email: cleanEmail,
                address: cleanAddress,
                owner_id
            });

        return res.status(201).json({
            message: "Store created successfully",
            store
        });

    } catch (error) {
        console.error("Create store error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    getDashboardStats,
    getAllUsers,
    getUserDetails,
    createUser,
    getAllStores,
    createStore
};

