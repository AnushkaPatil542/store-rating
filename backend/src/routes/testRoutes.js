const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get(
    "/protected",
    authenticate,
    (req, res) => {
        res.json({
            message: "You accessed a protected route",
            user: req.user
        });
    }
);

router.get(
    "/admin-only",
    authenticate,
    authorize("ADMIN"),
    (req, res) => {
        res.json({
            message: "Welcome Admin"
        });
    }
);

module.exports = router;