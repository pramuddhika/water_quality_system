import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, get } from "firebase/database";
import Chart from "chart.js/auto";

const DataVisualization = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state

  // Fetch devices from Firebase
  useEffect(() => {
    const fetchDevices = async () => {
      const deviceRef = ref(database, "devices");
      const snapshot = await get(deviceRef);
      if (snapshot.exists()) {
        setDevices(snapshot.val());
      }
    };
    fetchDevices();
  }, []);

  // Handle device selection
  const handleDeviceSelect = async (e) => {
    const deviceKey = e.target.value;

    // Reset states and set loading to true
    setLoading(true);
    setSelectedDevice(null);
    setSensorData({});

    // Delay before fetching new device data
    setTimeout(async () => {
      if (deviceKey) {
        const selected = devices[deviceKey];
        setSelectedDevice(selected);
        setSensorData(selected.sensor_data);
      }
      setLoading(false); // Reset loading state
    }, 1000); // Adjust the delay as necessary
  };

  let charts = {}; // Store chart instances

  const renderChart = (canvasId, data, label) => {
    // Check if a chart instance already exists and destroy it
    if (charts[canvasId]) {
      charts[canvasId].destroy();
    }

    const ctx = document.getElementById(canvasId).getContext("2d");

    // Create a new chart instance and store it in the charts object
    charts[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: label,
            data: Object.values(data),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  };

  useEffect(() => {
    if (selectedDevice && sensorData) {
      renderChart("phChart", sensorData.ph, "pH Levels");
      renderChart("tdsChart", sensorData.tds, "TDS Levels");
      renderChart("turbidityChart", sensorData.turbidity, "Turbidity Levels");
    }
  }, [sensorData]);

  // Calculate averages
  const calculateAverage = (data) => {
    if (!data || Object.keys(data).length === 0) return 0;
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    return (total / Object.values(data).length).toFixed(2);
  };

  const averagePh = calculateAverage(sensorData.ph);
  const averageTds = calculateAverage(sensorData.tds);
  const averageTurbidity = calculateAverage(sensorData.turbidity);

  return (
    <div className="p-4">
      <label className="block text-lg font-semibold">Select Sensor:</label>
      <select
        onChange={handleDeviceSelect}
        className="mt-2 mb-4 p-2 border rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Select a Sensor --</option>
        {Object.keys(devices).map((deviceKey) => (
          <option key={deviceKey} value={deviceKey}>
            {deviceKey}
          </option>
        ))}
      </select>

      {loading ? ( // Display loading indicator while fetching data
        <div className="flex justify-center items-center h-32">
          <div className="loader">Loading...</div> {/* You can replace this with a spinner */}
        </div>
      ) : (
        selectedDevice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Side: Device Info and Averages */}
            <div className="border p-4 rounded shadow-lg">
              <h2 className="text-xl font-semibold">Sensor Information</h2>
              <div className="flex items-center justify-between mt-2">
                <input
                  type="text"
                  value={selectedDevice.location}
                  readOnly
                  className="border border-gray-300 p-2 rounded w-1/2 mr-2"
                />
                <input
                  type="text"
                  value={selectedDevice.username}
                  readOnly
                  className="border border-gray-300 p-2 rounded w-1/2"
                />
              </div>
              <h2 className="text-xl font-semibold mt-4">Average Values</h2>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Average pH:</span>
                  <span>{averagePh}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Average TDS:</span>
                  <span>{averageTds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Average Turbidity:</span>
                  <span>{averageTurbidity}</span>
                </div>
              </div>
            </div>

            {/* Right Side: All Charts */}
            <div className="flex flex-col gap-4">
              <div className="bg-red-200 p-2 rounded h-1/4">
                <canvas id="phChart"></canvas>
              </div>
              <div className="bg-green-200 p-2 rounded h-1/4">
                <canvas id="tdsChart"></canvas>
              </div>
              <div className="bg-blue-200 p-2 rounded h-1/2">
                <canvas id="turbidityChart"></canvas>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DataVisualization;
