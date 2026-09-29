const axios = require("axios");


const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL ||
    "http://127.0.0.1:8000";


const analyzeRequest = async (data) => {

    try {

        const response = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            data,
            {
                timeout: 30000
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "\n=============================="
        );

        console.error(
            "ML SERVICE REQUEST FAILED"
        );

        console.error(
            "=============================="
        );

        console.error(
            "Message:",
            error.message
        );

        if (error.response) {

            console.error(
                "Status:",
                error.response.status
            );

            console.error(
                "Response:",
                JSON.stringify(
                    error.response.data,
                    null,
                    2
                )
            );

        }

        console.error(
            "==============================\n"
        );


        throw new Error(
            "ML service unavailable"
        );
    }
};


module.exports = {
    analyzeRequest
};