const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const analysisRoutes = require("./routes/analysisRoutes");
const eventRoutes = require("./routes/eventRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();


console.log("=================================");
console.log("THIS IS THE API SENTINEL SERVER");
console.log("SERVER.JS LOADED");
console.log("=================================");

    
app.use(cors());
app.use(express.json());


// ========================================
// AUTH ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.get("/api/auth-direct-test",(req,res)=>{
    res.json({
        message: "Direct AUTH route works"
    });
});


// ========================================
// OTHER API ROUTES
// ========================================

app.use("/api/dashboard", dashboardRoutes);
app.use("/api", analysisRoutes);
app.use("/api", eventRoutes);


// ========================================
// ROOT
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "API Sentinel Backend is running!"
    });
});


// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(
                `API Sentinel backend running on port ${PORT}`
            );
        });

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });