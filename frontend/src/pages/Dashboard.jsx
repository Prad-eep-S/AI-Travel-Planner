
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function Dashboard() {
  const [trip, setTrip] = useState({
    destination: "",
    durationDays: "",
    budgetTier: "Medium",
    interests: "",
  });

  const [generatedTrip, setGeneratedTrip] =
    useState(null);

  const [trips, setTrips] = useState([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data } = await API.get(
        "/trips"
      );

      setTrips(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setTrip({
      ...trip,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = {
        destination:
          trip.destination,
        durationDays: Number(
          trip.durationDays
        ),
        budgetTier:
          trip.budgetTier,
        interests:
          trip.interests
            .split(",")
            .map((item) =>
              item.trim()
            ),
      };

      const { data } =
        await API.post(
          "/trips",
          payload
        );

      setGeneratedTrip(data);

      await fetchTrips();

      setTrip({
        destination: "",
        durationDays: "",
        budgetTier: "Medium",
        interests: "",
      });

      alert(
        "Trip Generated Successfully"
      );
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data
          ?.message ||
          "Failed to Generate Trip"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (
    tripId
  ) => {
    try {
      await API.delete(
        `/trips/${tripId}`
      );

      setTrips((prev) =>
        prev.filter(
          (trip) =>
            trip._id !== tripId
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">

      {/* Navbar */}
      <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">
          AI Travel Planner
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8">

        {/* Create Trip */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Create Your Next Adventure ✈️
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid md:grid-cols-2 gap-5"
          >
            <input
              name="destination"
              placeholder="Destination"
              value={trip.destination}
              onChange={handleChange}
              className="border rounded-xl p-3"
            />

            <input
              name="durationDays"
              type="number"
              placeholder="Days"
              value={trip.durationDays}
              onChange={handleChange}
              className="border rounded-xl p-3"
            />

            <select
              name="budgetTier"
              value={trip.budgetTier}
              onChange={handleChange}
              className="border rounded-xl p-3"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              name="interests"
              placeholder="Food, Culture, Anime"
              value={trip.interests}
              onChange={handleChange}
              className="border rounded-xl p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90"
            >
              {loading
                ? "Generating..."
                : "Generate AI Trip"}
            </button>
          </form>
        </div>

        {/* My Trips */}
        <h2 className="text-3xl font-bold mb-6">
          My Trips 🌍
        </h2>

        {trips.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow text-center">
            No trips created yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition"
              >
                <h3 className="text-2xl font-bold text-blue-600">
                  {trip.destination}
                </h3>

                <p className="mt-2">
                  📅 {trip.durationDays} Days
                </p>

                <p>
                  💰 {trip.budgetTier}
                </p>

                <div className="flex gap-3 mt-5">
                  <Link
                    to={`/trip/${trip._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    View
                  </Link>

                  <button
                    onClick={() =>
                      deleteTrip(
                        trip._id
                      )
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generated Trip Preview */}
        {generatedTrip && (
          <div className="mt-12 bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6">
              Latest Generated Trip
            </h2>

            <h3 className="text-2xl font-semibold text-blue-600">
              {generatedTrip.destination}
            </h3>

            <div className="mt-6">
              {generatedTrip.itinerary?.map(
                (day) => (
                  <div
                    key={day.day}
                    className="mb-6"
                  >
                    <h4 className="font-bold text-xl">
                      Day {day.day}
                    </h4>

                    <ul className="list-disc pl-5">
                      {day.activities?.map(
                        (
                          activity,
                          index
                        ) => (
                          <li
                            key={index}
                          >
                            {typeof activity ===
                            "object"
                              ? activity.description
                              : activity}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-xl">
                Hotels
              </h3>

              <ul className="list-disc pl-5">
                {generatedTrip.hotels?.map(
                  (
                    hotel,
                    index
                  ) => (
                    <li key={index}>
                      {hotel.name} (
                      {hotel.type})
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="mt-6 text-2xl font-bold text-green-600">
              Total Budget: $
              {
                generatedTrip
                  .estimatedBudget
                  ?.total
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

