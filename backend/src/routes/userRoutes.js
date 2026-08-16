
const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getStores,
    submitRating,
    updateRating,
    changePassword
} = require("../controllers/userController");


// =====================================================
// GET STORES
// =====================================================

router.get(
    "/stores",
    authenticate,
    authorize("USER"),
    getStores
);


// =====================================================
// SUBMIT RATING
// =====================================================

router.post(
    "/stores/:storeId/rating",
    authenticate,
    authorize("USER"),
    submitRating
);


// =====================================================
// UPDATE RATING
// =====================================================

router.put(
    "/stores/:storeId/rating",
    authenticate,
    authorize("USER"),
    updateRating
);


// =====================================================
// CHANGE PASSWORD
// USER + STORE OWNER
// =====================================================

router.put(
    "/user/password",
    authenticate,
    authorize("USER", "STORE_OWNER"),
    changePassword
);


module.exports = router;
