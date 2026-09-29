const express = require("express");

const {
    getEvents,
    getEventById
} = require("../controllers/eventController");

const router = express.Router();

router.get("/events", getEvents);
router.get("/events/:id", getEventById);

module.exports = router;