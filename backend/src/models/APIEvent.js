const mongoose = require("mongoose");

const apiEventSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            required: true
        },

        requestUrl: {
            type: String,
            required: true
        },

        requestBody: {
            type: String,
            default: ""
        },

        requestHeaders: {
            type: String,
            default: ""
        },

        responseBody: {
            type: String,
            default: ""
        },

        responseHeaders: {
            type: String,
            default: ""
        },

        responseSize: {
            type: Number,
            default: 0
        },

        sourceIp: {
            type: String,
            default: ""
        },

        sourcePort: {
            type: Number,
            default: 0
        },

        status: {
            type: Number,
            default: 200
        },

        targetIp: {
            type: String,
            default: ""
        },

        targetPort: {
            type: Number,
            default: 8000
        },

        responseTime: {
            type: Number,
            default: 0
        },

        userIdentity: {
            type: String,
            default: ""
        },

        prediction: {
            type: String,
            required: true
        },

        anomalyScore: {
            type: Number,
            required: true
        },

        threshold: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("APIEvent", apiEventSchema);