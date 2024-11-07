import { useState, useEffect } from "react";
import { ref, get, child } from "firebase/database";
import { database } from "./firebase";
import Table from "react-bootstrap/Table";

const SensorData = () => {
  const [devices, setDevices] = useState([]);
  const userData = localStorage.getItem("userData");
  const currentUser = JSON.parse(userData);

  // Function to format the date in yyyy-mm-dd format
  const formatDate = (dateString) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  // Function to format time from HHMMSS to hh:mm:ss
  const formatTime = (timeString) => {
    const hours = timeString.substring(0, 2);
    const minutes = timeString.substring(2, 4);
    const seconds = timeString.substring(4, 6);
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchDevices = async () => {
      const dbRef = ref(database);
      try {
        const snapshot = await get(child(dbRef, "devices"));
        
        if (snapshot.exists()) {
          const devicesData = snapshot.val();
          const clientDevices = [];

          // Iterate through each device to find if the client exists and get formatted dates, times, and coordinates
          for (const [deviceId, clients] of Object.entries(devicesData)) {
            if (currentUser.username in clients) {
              const datesData = clients[currentUser.username];

              const formattedDates = Object.keys(datesData).map(dateKey => {
                const formattedDate = formatDate(dateKey);
                const timesData = datesData[dateKey];

                const times = Object.entries(timesData).map(([time, timeDetails]) => {
                  const { location: { coordinates } = {} } = timeDetails;
                  return { time: formatTime(time), coordinates };
                });

                return { date: formattedDate, times };
              });

              clientDevices.push({ deviceId, dates: formattedDates });
            }
          }

          // Update the local state and store the result in localStorage
          setDevices(clientDevices);

          // Add devices with formatted dates and times to userData and store it back in localStorage
          const updatedUserData = { ...currentUser, devices: clientDevices };
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching devices: ", error);
      }
    };

    fetchDevices();
  }, [currentUser.username]);

  // Function to handle clicking the eye button
  const handleViewLocation = (coordinates) => {
    console.log("Selected location coordinates:", coordinates);
  };

  return (
    <div>
      <div className="flex items-center gap-5 mt-4"> 
        <p className="font-bold ml-3">Your devices list</p>
        <input
          type="text"
          id="deviceName"
          className="border border-gray-200 rounded-lg p-2 w-[800px] mt-1 focus:outline-none"
          placeholder={
            devices.length > 0
              ? devices.map(device => `${device.deviceId}`).join(" | ")
              : "No devices found"
          }
          aria-label="Device Name"
          readOnly
        />
      </div>
      
      <div className="mt-10">
        <p className="font-bold mb-3">Device Usage Summary</p>
        <div className="table-responsive">
          <Table bordered striped hover>
            <thead className="bg-gray-200">
              <tr>
                <th>Device Id</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                device.dates.map(date => (
                  date.times.map(time => (
                    <tr key={`${device.deviceId}-${date.date}-${time.time}`}>
                      <td>{device.deviceId}</td>
                      <td>{date.date}</td>
                      <td>{time.time}</td>
                      <td className="flex justify-between">
                        {time.coordinates}
                        <button
                          className="text-end mr-3"
                          onClick={() => handleViewLocation(time.coordinates)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ))
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SensorData;
