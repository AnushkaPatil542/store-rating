const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getOwnerDashboard
} = require("../controllers/ownerController");


router.get(
    "/dashboard",
    authenticate,
    authorize("STORE_OWNER"),
    getOwnerDashboard
);


module.exports = router;