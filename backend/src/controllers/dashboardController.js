const APIEvent = require("../models/APIEvent");

const getDashboardStats = async (req, res) => {
    try {
        const totalRequests = await APIEvent.countDocuments();

        const anomalies = await APIEvent.countDocuments({
            prediction: "anomaly"
        });

        const normalRequests = await APIEvent.countDocuments({
            prediction: "normal"
        });

        const anomalyRate =
            totalRequests > 0
                ? ((anomalies / totalRequests) * 100).toFixed(2)
                : "0.00";

        res.json({
            success: true,
            stats: {
                totalRequests,
                normalRequests,
                anomalies,
                anomalyRate: Number(anomalyRate)
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

const getRecentAnomalies = async (req, res) => {
    try {
        const anomalies = await APIEvent
            .find({ prediction: "anomaly" })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            count: anomalies.length,
            anomalies
        });

    } catch (error) {
        console.error("Recent Anomalies Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent anomalies"
        });
    }
};

const getTimeline = async (req, res) => {
    try {
        const timeline = await APIEvent.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        hour: { $hour: "$createdAt" }
                    },

                    totalRequests: { $sum: 1 },

                    anomalies: {
                        $sum: {
                            $cond: [
                                { $eq: ["$prediction", "anomaly"] },
                                1,
                                0
                            ]
                        }
                    },

                    normalRequests: {
                        $sum: {
                            $cond: [
                                { $eq: ["$prediction", "normal"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                    "_id.hour": 1
                }
            }
        ]);

        res.json({
            success: true,
            timeline
        });

    } catch (error) {
        console.error("Timeline Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch timeline data"
        });
    }
};
const getMethodDistribution = async (req, res) => {
    try {
        const methods = await APIEvent.aggregate([
            {
                $group: {
                    _id: "$method",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);

        res.json({
            success: true,
            methods
        });

    } catch (error) {
        console.error("Method Distribution Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch method distribution"
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentAnomalies,
    getTimeline,
    getMethodDistribution
};