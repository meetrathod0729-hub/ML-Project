const express = require("express");

const {
    getDashboardStats,getRecentAnomalies,getTimeline,getMethodDistribution
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/recent-anomalies", getRecentAnomalies);
router.get("/timeline", getTimeline)
router.get("/method",getMethodDistribution)

module.exports = router;