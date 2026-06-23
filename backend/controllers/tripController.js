const Trip = require("../models/Trip");

const {
  generateTravelPlan,
  regenerateDayPlan,
} = require("../services/geminiService");
// Create Trip
const createTrip = async (req, res) => {
  try {
    const {
      destination,
      durationDays,
      budgetTier,
      interests,
    } = req.body;

    const aiResponse =
      await generateTravelPlan(
        destination,
        durationDays,
        budgetTier,
        interests
      );

    const cleanedResponse = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed =
      JSON.parse(cleanedResponse);

    const trip = await Trip.create({
      user: req.user._id,
      destination,
      durationDays,
      budgetTier,
      interests,
      itinerary:
        parsed.itinerary || [],
      hotels: parsed.hotels || [],
      estimatedBudget:
        parsed.estimatedBudget || {},
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Trips
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      user: req.user._id,
    });

    res.json(trips);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Trip
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    await trip.deleteOne();

    res.json({
      message:
        "Trip deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Regenerate Day
const regenerateDay = async (
  req,
  res
) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const { day, instruction } =
      req.body;

    const dayIndex =
      trip.itinerary.findIndex(
        (item) =>
          Number(item.day) ===
          Number(day)
      );

    if (dayIndex === -1) {
      return res.status(404).json({
        message:
          "Day not found in itinerary",
      });
    }

    const aiResponse =
      await regenerateDayPlan(
        trip.destination,
        day,
        instruction
      );

    const cleanedResponse =
      aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed =
      JSON.parse(cleanedResponse);

    trip.itinerary[dayIndex] = {
      day: Number(day),
      activities:
        parsed.activities || [],
    };

    trip.markModified(
      "itinerary"
    );

    await trip.save();

    res.json({
      message: `Day ${day} regenerated successfully`,
      itinerary: trip.itinerary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Add Activity
const addActivity = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const { day, activity } = req.body;

    console.log("Activity Received:", activity);

    const dayData = trip.itinerary.find(
      (item) =>
        Number(item.day) === Number(day)
    );

    if (!dayData) {
      return res.status(404).json({
        message: "Day not found",
      });
    }

    if (
      !activity ||
      activity.trim() === ""
    ) {
      return res.status(400).json({
        message: "Activity is required",
      });
    }

    dayData.activities.push(
      activity.trim()
    );

    await trip.save();

    res.json({
      message: "Activity added successfully",
      itinerary: trip.itinerary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Activity
const deleteActivity = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const { day, activityIndex } =
      req.body;

    const dayData = trip.itinerary.find(
      (item) =>
        Number(item.day) === Number(day)
    );

    if (!dayData) {
      return res.status(404).json({
        message: "Day not found",
      });
    }

    if (
      activityIndex === undefined ||
      activityIndex < 0 ||
      activityIndex >=
        dayData.activities.length
    ) {
      return res.status(400).json({
        message: "Invalid activity index",
      });
    }

    console.log(
      "Before delete:",
      dayData.activities
    );

    dayData.activities.splice(
      Number(activityIndex),
      1
    );

    console.log(
      "After delete:",
      dayData.activities
    );

    // IMPORTANT
    trip.markModified("itinerary");

    await trip.save();

    const updatedTrip =
      await Trip.findById(trip._id);

    res.json({
      message:
        "Activity deleted successfully",
      itinerary:
        updatedTrip.itinerary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const editActivity = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    const { day, activityIndex, newActivity } =
      req.body;

    const dayData = trip.itinerary.find(
      (item) =>
        Number(item.day) === Number(day)
    );

    dayData.activities[activityIndex] =
      newActivity;

    trip.markModified("itinerary");

    await trip.save();

    res.json({
      message: "Activity updated",
      itinerary: trip.itinerary,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  deleteTrip,
  regenerateDay,
  addActivity,
  deleteActivity,
};