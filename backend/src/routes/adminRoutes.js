const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getDashboardStats,
    getAllUsers,createUser
} = require("../controllers/adminController");




router.get(
    "/dashboard",
    authenticate,
    authorize("ADMIN"),
    getDashboardStats
);


router.get(
    "/users",
    authenticate,
    authorize("ADMIN"),
    getAllUsers
);
router.post(
    "/users",
    authenticate,
    authorize("ADMIN"),
    createUser
);


module.exports = router;