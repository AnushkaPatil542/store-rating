const bcrypt = require("bcryptjs");
const { User } = require("../models");
const jwt = require("jsonwebtoken");


// =====================================================
// REGISTER
// =====================================================

const register = async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        // Required fields
        if (!name || !email || !password || !address) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Remove unnecessary spaces
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanAddress = address.trim();

        // =================================================
        // NAME VALIDATION
        // =================================================

        if (cleanName.length < 20 || cleanName.length > 60) {
            return res.status(400).json({
                message: "Name must be between 20 and 60 characters"
            });
        }

        // =================================================
        // ADDRESS VALIDATION
        // =================================================

        if (cleanAddress.length > 400) {
            return res.status(400).json({
                message: "Address must not exceed 400 characters"
            });
        }

        // =================================================
        // EMAIL VALIDATION
        // =================================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // =================================================
        // PASSWORD VALIDATION
        // 8-16 characters
        // At least one uppercase
        // At least one special character
        // =================================================

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must be 8-16 characters with at least one uppercase letter and one special character"
            });
        }

        // =================================================
        // CHECK EXISTING USER
        // =================================================

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

        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // =================================================
        // CREATE USER
        // =================================================

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            address: cleanAddress,
            role: "USER"
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Required fields
        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const cleanEmail =
            email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            where: {
                email: cleanEmail
            }
        });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        // =================================================
        // GENERATE JWT
        // =================================================

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
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
    register,
    login
};