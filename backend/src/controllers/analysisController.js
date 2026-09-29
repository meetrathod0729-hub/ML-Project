const { analyzeRequest } = require("../services/mlService");
const APIEvent = require("../models/APIEvent");


// =========================================================
// SAFE NUMBER CONVERSION
// =========================================================

const safeNumber = (value, defaultValue = 0) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return defaultValue;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
        return number;
    }

    return defaultValue;
};


// =========================================================
// SAFE INTEGER CONVERSION
// =========================================================

const safeInteger = (value, defaultValue = 200) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return defaultValue;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
        return Math.trunc(number);
    }

    return defaultValue;
};


// =========================================================
// ANALYZE API
// =========================================================

const analyzeAPI = async (req, res) => {

    try {

        // -----------------------------------------------------
        // ORIGINAL REQUEST
        // -----------------------------------------------------

        const requestData = req.body;


        // -----------------------------------------------------
        // NORMALIZE DATA
        //
        // Keep the same normalization rules used by the
        // ML service so MongoDB receives valid values.
        // -----------------------------------------------------

        const normalizedData = {

            method:
                String(
                    requestData.method || "GET"
                ).toUpperCase(),

            request_url:
                String(
                    requestData.request_url || ""
                ),

            request_body:
                String(
                    requestData.request_body || ""
                ),

            request_headers:
                String(
                    requestData.request_headers || ""
                ),

            response_body:
                String(
                    requestData.response_body || ""
                ),

            response_headers:
                String(
                    requestData.response_headers || ""
                ),

            response_size:
                safeNumber(
                    requestData.response_size,
                    0
                ),

            source_port:
                safeNumber(
                    requestData.source_port,
                    0
                ),

            status:
                safeInteger(
                    requestData.status,
                    200
                ),

            target_port:
                safeNumber(
                    requestData.target_port,
                    8000
                ),

            response_time:
                safeNumber(
                    requestData.response_time,
                    0
                ),

            source_ip:
                String(
                    requestData.source_ip || ""
                ),

            target_ip:
                String(
                    requestData.target_ip || ""
                ),

            user_identity:
                String(
                    requestData.user_identity || ""
                )
        };


        // -----------------------------------------------------
        // SEND NORMALIZED DATA TO ML SERVICE
        // -----------------------------------------------------

        const mlResult =
            await analyzeRequest(
                normalizedData
            );


        // -----------------------------------------------------
        // SAVE EVENT
        //
        // IMPORTANT:
        // Use normalizedData instead of req.body so malformed
        // numeric fields cannot break Mongoose validation.
        // -----------------------------------------------------

        const event = new APIEvent({

            method:
                normalizedData.method,

            requestUrl:
                normalizedData.request_url,

            requestBody:
                normalizedData.request_body,

            requestHeaders:
                normalizedData.request_headers,

            responseBody:
                normalizedData.response_body,

            responseHeaders:
                normalizedData.response_headers,

            responseSize:
                normalizedData.response_size,

            sourceIp:
                normalizedData.source_ip,

            sourcePort:
                normalizedData.source_port,

            status:
                normalizedData.status,

            targetIp:
                normalizedData.target_ip,

            targetPort:
                normalizedData.target_port,

            responseTime:
                normalizedData.response_time,

            userIdentity:
                normalizedData.user_identity,

            prediction:
                mlResult.prediction,

            anomalyScore:
                mlResult.anomaly_score,

            threshold:
                mlResult.threshold
        });


        // -----------------------------------------------------
        // SAVE TO MONGODB
        // -----------------------------------------------------

        await event.save();


        // -----------------------------------------------------
        // SUCCESS RESPONSE
        // -----------------------------------------------------

        res.json({

            success: true,

            result: mlResult,

            eventId: event._id

        });

    }

    catch (error) {

        console.error(
            "\n=============================="
        );

        console.error(
            "ANALYSIS ERROR"
        );

        console.error(
            "=============================="
        );

        console.error(
            error.message
        );

        console.error(
            "==============================\n"
        );


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


module.exports = {
    analyzeAPI
};