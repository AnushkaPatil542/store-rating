
const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getDashboardStats,
    getAllUsers,
    getUserDetails,
    createUser,
    getAllStores,
    createStore
} = require("../controllers/adminController");


// =====================================================
// DASHBOARD
// =====================================================

router.get(
    "/dashboard",
    authenticate,
    authorize("ADMIN"),
    getDashboardStats
);


// =====================================================
// USERS
// =====================================================

router.get(
    "/users",
    authenticate,
    authorize("ADMIN"),
    getAllUsers
);


router.get(
    "/users/:id",
    authenticate,
    authorize("ADMIN"),
    getUserDetails
);


router.post(
    "/users",
    authenticate,
    authorize("ADMIN"),
    createUser
);


// =====================================================
// STORES
// =====================================================

router.get(
    "/stores",
    authenticate,
    authorize("ADMIN"),
    getAllStores
);


router.post(
    "/stores",
    authenticate,
    authorize("ADMIN"),
    createStore
);


module.exports = router;

