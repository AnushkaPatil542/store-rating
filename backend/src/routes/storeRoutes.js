const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    createStore,
    getAllStores
} = require("../controllers/storeController");


router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createStore
);


router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    getAllStores
);


module.exports = router;