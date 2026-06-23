const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  deleteTrip,
  regenerateDay,
  addActivity,
  deleteActivity,
} = require("../controllers/tripController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTrip);

router.get("/", protect, getTrips);

router.get("/:id", protect, getTripById);

router.delete("/:id", protect, deleteTrip);

router.put(
  "/:id/regenerate-day",
  protect,
  regenerateDay
);

router.put(
  "/:id/add-activity",
  protect,
  addActivity
);

router.delete(
  "/:id/activity",
  protect,
  deleteActivity
);

module.exports = router;