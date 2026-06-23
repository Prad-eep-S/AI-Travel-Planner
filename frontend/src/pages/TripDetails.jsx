import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

function TripDetails() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);

  useEffect(() => {
    fetchTrip();
  }, []);

  const fetchTrip = async () => {
    try {
      const { data } = await API.get(
        `/trips/${id}`
      );

      setTrip(data);
    } catch (error) {
      console.log(error);
    }
  };

  const regenerateDay = async (day) => {
    const instruction = prompt(
      "How would you like to modify this day?"
    );

    if (!instruction) return;

    try {
      const { data } = await API.put(
        `/trips/${id}/regenerate-day`,
        {
          day,
          instruction,
        }
      );

      setTrip((prev) => ({
        ...prev,
        itinerary: data.itinerary,
      }));

      alert("Day regenerated successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to regenerate day");
    }
  };

  const addActivity = async (day) => {
    const activity = prompt(
      "Enter activity"
    );

    if (!activity?.trim()) return;

    try {
      const { data } = await API.put(
        `/trips/${id}/add-activity`,
        {
          day,
          activity: activity.trim(),
        }
      );

      setTrip((prev) => ({
        ...prev,
        itinerary: data.itinerary,
      }));

      alert("Activity added");
    } catch (error) {
      console.log(error);
      alert("Failed to add activity");
    }
  };

  const deleteActivity = async (
    day,
    activityIndex
  ) => {
    try {
      const { data } = await API.delete(
        `/trips/${id}/activity`,
        {
          data: {
            day,
            activityIndex,
          },
        }
      );

      setTrip((prev) => ({
        ...prev,
        itinerary: data.itinerary,
      }));

      alert("Activity deleted");
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <h1 className="text-3xl font-bold">
          Loading...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 p-8">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        <h1 className="text-5xl font-bold text-blue-600">
          {trip.destination}
        </h1>

        <div className="flex gap-4 mt-5">
          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
            {trip.durationDays} Days
          </span>

          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
            {trip.budgetTier} Budget
          </span>
        </div>
      </div>

      {/* Itinerary */}
      <h2 className="text-3xl font-bold mb-6">
        ✈️ Travel Itinerary
      </h2>

      {trip.itinerary?.map((day) => (
        <div
          key={day.day}
          className="bg-white rounded-3xl shadow-lg p-6 mb-6 hover:shadow-2xl transition duration-300"
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-2xl font-bold">
              Day {day.day}
            </h3>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  regenerateDay(day.day)
                }
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
              >
                🔄 Regenerate
              </button>

              <button
                onClick={() =>
                  addActivity(day.day)
                }
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
              >
                ➕ Add Activity
              </button>
            </div>
          </div>

          <ul className="space-y-3">
            {day.activities?.map(
              (activity, index) => (
                <li
                  key={index}
                  className="bg-gray-50 border rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    {typeof activity ===
                    "object" ? (
                      <>
                        {activity.time && (
                          <p className="text-blue-600 font-semibold">
                            {
                              activity.time
                            }
                          </p>
                        )}

                        <p className="mt-1">
                          {activity.description}
                        </p>

                        {activity.interest && (
                          <span className="inline-block mt-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                            {
                              activity.interest
                            }
                          </span>
                        )}
                      </>
                    ) : (
                      <p>{activity}</p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      deleteActivity(
                        day.day,
                        index
                      )
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                  >
                    🗑
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      ))}

      {/* Hotels */}
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
        <h2 className="text-3xl font-bold mb-5">
          🏨 Recommended Hotels
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {trip.hotels?.map(
            (hotel, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 bg-gray-50"
              >
                <h3 className="font-bold text-lg">
                  {hotel.name}
                </h3>

                <p className="text-gray-600">
                  {hotel.type}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-3xl font-bold mb-5">
          💰 Budget Breakdown
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            Flights: $
            {trip.estimatedBudget?.flights}
          </div>

          <div className="bg-green-50 p-4 rounded-xl">
            Accommodation: $
            {
              trip.estimatedBudget
                ?.accommodation
            }
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
            Food: $
            {trip.estimatedBudget?.food}
          </div>

          <div className="bg-purple-50 p-4 rounded-xl">
            Activities: $
            {
              trip.estimatedBudget
                ?.activities
            }
          </div>
        </div>

        <div className="mt-6 text-3xl font-bold text-green-600">
          Total: $
          {trip.estimatedBudget?.total}
        </div>
      </div>
    </div>
  );
}

export default TripDetails;