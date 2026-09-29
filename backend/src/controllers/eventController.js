const APIEvent = require("../models/APIEvent");


// =========================================================
// GET API EVENTS
// =========================================================

const getEvents = async (req, res) => {
    try {

        // -----------------------------------------------------
        // Fetch latest 100 events for the table
        // -----------------------------------------------------

        const events = await APIEvent
            .find()
            .sort({ createdAt: -1 })
            .limit(100);


        // -----------------------------------------------------
        // Fetch GLOBAL statistics from entire collection
        // -----------------------------------------------------

        const totalEvents = await APIEvent.countDocuments();

        const anomalies = await APIEvent.countDocuments({
            prediction: "anomaly"
        });

        const normalEvents = await APIEvent.countDocuments({
            prediction: "normal"
        });


        // -----------------------------------------------------
        // Anomaly rate
        // -----------------------------------------------------

        const anomalyRate =
            totalEvents > 0
                ? ((anomalies / totalEvents) * 100).toFixed(2)
                : "0.00";


        // -----------------------------------------------------
        // Response
        // -----------------------------------------------------

        res.json({
            success: true,

            // Number of events actually returned
            returnedCount: events.length,

            // Global statistics
            stats: {
                total: totalEvents,
                normal: normalEvents,
                anomalies: anomalies,
                anomalyRate: Number(anomalyRate)
            },

            // Latest events for table
            events
        });

    } catch (error) {

        console.error(
            "Get Events Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch API events"
        });
    }
};


// =========================================================
// GET SINGLE EVENT
// =========================================================

const getEventById = async (req, res) => {
    try {

        const event = await APIEvent.findById(
            req.params.id
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "API event not found"
            });
        }

        res.json({
            success: true,
            event
        });

    } catch (error) {

        console.error(
            "Get Event Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch API event"
        });
    }
};


module.exports = {
    getEvents,
    getEventById
};