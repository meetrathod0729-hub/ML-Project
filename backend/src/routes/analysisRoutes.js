const express = require("express");

const { analyzeAPI } = require("../controllers/analysisController");

const router = express.Router();

router.post("/analyze", analyzeAPI);

module.exports = router;