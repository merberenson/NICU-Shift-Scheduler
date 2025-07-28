import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import NurseLayout from "../components/NurseLayout";

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const timeOptions = [
  { value: "day", label: "DAY" },
  { value: "night", label: "NIGHT" },
  { value: "unavailable", label: "UNAVAILABLE" }
];

const UpdateAvailability = () => {
  const { user, logout } = useAuth();
  const [availability, setAvailability] = useState(
    daysOfWeek.map(day => ({ dayOfWeek: day, timeOfDay: "unavailable" }))
  );

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`/nurses/${user._id}/availability`);
        if (res.data && res.data.availability) {
          setAvailability(res.data.availability);
        }
      } catch (err) {
        console.error("Failed to load availability", err);
      }
    };

    if (user?._id) fetchAvailability();
  }, [user]);

  const handleUpdateTime = (day, value) => {
    setAvailability(prev =>
      prev.map(item =>
        item.dayOfWeek === day ? { ...item, timeOfDay: value } : item
      )
    );
  };

  const handleUpdateAvailability = async (event) => {
    event.preventDefault();

    try {
      const nurseId = user.userData._id;
      console.log(user)
      console.log(nurseId)
      const response = await axios.patch(`/nurses/${nurseId}/availability`, {
        availability
      });
      console.log("Updated availability: ", response.data);
    } catch (err) {
      console.error("Update failed: ", err.response?.data || err.message);
    }
  };

  return (
    <NurseLayout>
    <form onSubmit={handleUpdateAvailability}>
      <h2>Update Your Weekly Availability</h2>
      {daysOfWeek.map(day => (
        <div key={day}>
          {day}:
          <select
            value={
              availability.find(item => item.dayOfWeek === day)?.timeOfDay ||
              "unavailable"
            }
            onChange={e => handleUpdateTime(day, e.target.value)}
          >
            {timeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
    </NurseLayout>
  );
};

export { UpdateAvailability };
