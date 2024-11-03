import { useState, useEffect } from "react";
import { ref, get, child } from "firebase/database";
import { database } from "./firebase";

const SensorData = () => {
  const [devices, setDevices] = useState([]);
  const userData = localStorage.getItem("userData");
  const currentUser = JSON.parse(userData);

  useEffect(() => {
    const fetchDevices = async () => {
      const dbRef = ref(database);
      try {
        const snapshot = await get(child(dbRef, "devices"));
        
        if (snapshot.exists()) {
          const devicesData = snapshot.val();
          const clientDevices = [];

          // Iterate through each device to find if the client exists
          for (const [deviceId, clients] of Object.entries(devicesData)) {
            if (currentUser.username in clients) {
              clientDevices.push(deviceId);
            }
          }

          // Update the local state and store the result in localStorage
          setDevices(clientDevices);

          // Add devices to userData and store it back in localStorage
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

  return (
    <div>
      <div className="flex items-center gap-5 mt-4"> 
        <p className="font-bold ml-3">Your devices list</p>
        <input
          type="text"
          id="deviceName"
          className="border border-gray-200 rounded-lg p-2 w-[800px] mt-1 focus:outline-none"
          placeholder={devices.length > 0 ? devices.join(", ") : "No devices found"}
          aria-label="Device Name"
          readOnly
        />
      </div>
    </div>
  );
};

export default SensorData;
