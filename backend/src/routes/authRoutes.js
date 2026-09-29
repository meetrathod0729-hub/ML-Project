const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const router = express.Router();

console.log("AUTH ROUTES LOADED");

// Test route
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "AUTH ROUTES ARE WORKING"
    });
});

// Register
router.post("/register", register);

// Login
router.post("/login", login);

module.exports = router;