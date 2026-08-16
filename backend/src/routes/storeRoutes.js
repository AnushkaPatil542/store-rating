const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getStores,
    createStore,
    submitRating,
    updateRating
} = require("../controllers/storeController");


// =====================================================
// GET ALL STORES
// USER + ADMIN
// =====================================================

router.get(
    "/",
    authenticate,
    authorize("USER", "ADMIN"),
    getStores
);


// =====================================================
// CREATE STORE
// ADMIN ONLY
// =====================================================

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createStore
);


// =====================================================
// SUBMIT RATING
// USER ONLY
// =====================================================

router.post(
    "/:storeId/rating",
    authenticate,
    authorize("USER"),
    submitRating
);


// =====================================================
// UPDATE RATING
// USER ONLY
// =====================================================

router.put(
    "/:storeId/rating",
    authenticate,
    authorize("USER"),
    updateRating
);


module.exports = router;