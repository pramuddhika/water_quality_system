/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, get } from "firebase/database";
import Chart from "chart.js/auto";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Select from "react-select";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

const ComapanyData = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [combinedSensorData, setCombinedSensorData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

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

  const handleDeviceSelect = (selectedOptions) => {
    const selectedKeys = selectedOptions.map((option) => option.value);
    setSelectedDevices(selectedKeys);
  };

  const fetchData = async () => {
    setLoading(true);
    setDataFetched(false);

    const dataPromises = selectedDevices.map(async (deviceKey) => {
      const selectedDevice = devices[deviceKey];
      return {
        ...selectedDevice,
        sensor_data: selectedDevice.sensor_data || {},
      };
    });

    const selectedDeviceData = await Promise.all(dataPromises);
    setCombinedSensorData(combineSensorData(selectedDeviceData));
    setLoading(false);
    setDataFetched(true);
  };

  const combineSensorData = (selectedDeviceData) => {
    const combinedData = { ph: {}, tds: {}, turbidity: {} };

    selectedDeviceData.forEach((device) => {
      for (const sensor in combinedData) {
        for (const [time, value] of Object.entries(
          device.sensor_data[sensor] || {}
        )) {
          if (!combinedData[sensor][time]) combinedData[sensor][time] = 0;
          combinedData[sensor][time] += value;
        }
      }
    });

    return combinedData;
  };

  const renderChart = (canvasId, data, label) => {
    const ctx = document.getElementById(canvasId)?.getContext("2d");
    if (ctx) {
      new Chart(ctx, {
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
    }
  };

  const calculateAverage = (data) => {
    if (!data || Object.keys(data).length === 0) return 0;
    const totalValues = Object.values(data).reduce(
      (sum, value) => sum + value,
      0
    );
    return (totalValues / Object.keys(data).length).toFixed(2);
  };

  const averagePh = calculateAverage(combinedSensorData.ph);
  const averageTds = calculateAverage(combinedSensorData.tds);
  const averageTurbidity = calculateAverage(combinedSensorData.turbidity);

  useEffect(() => {
    if (dataFetched && combinedSensorData) {
      renderChart("phChart", combinedSensorData.ph || {}, "Average pH Levels");
      renderChart(
        "tdsChart",
        combinedSensorData.tds || {},
        "Average TDS Levels"
      );
      renderChart(
        "turbidityChart",
        combinedSensorData.turbidity || {},
        "Average Turbidity Levels"
      );
    }
  }, [combinedSensorData, dataFetched]);

  const deviceOptions = Object.keys(devices).map((deviceKey) => ({
    value: deviceKey,
    label: deviceKey,
  }));

  return (
    <div className="p-4">
      <div className="flex">
        <label className="block text-lg font-semibold">Select Sensors:</label>
        <div className="col-6">
          <Select
            isMulti
            options={deviceOptions}
            onChange={handleDeviceSelect}
            className="mt-2 mb-4 p-2"
            placeholder="Select devices..."
          />
        </div>

        <button
          onClick={fetchData}
          className="h-9 px-4 mt-4 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600"
        >
          Get Data
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        dataFetched &&
        selectedDevices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="border p-4 rounded shadow-lg">
              <h2 className="text-xl font-semibold">Sensor Information</h2>
              <h2 className="text-xl font-semibold mt-4">
                Average Values (All Selected Devices)
              </h2>
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
              <div className="mt-4">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: "330px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <DeviceMarkers
                    selectedDevices={selectedDevices}
                    devices={devices}
                  />
                </MapContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div
                className="bg-red-200 p-2 rounded"
                style={{ height: "190px" }}
              >
                <canvas id="phChart"></canvas>
              </div>
              <div
                className="bg-green-200 p-2 rounded"
                style={{ height: "190px" }}
              >
                <canvas id="tdsChart"></canvas>
              </div>
              <div
                className="bg-blue-200 p-2 rounded"
                style={{ height: "190px" }}
              >
                <canvas id="turbidityChart"></canvas>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

const customIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/map-pin.png',
  iconSize: [48, 48], 
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

const DeviceMarkers = ({ selectedDevices, devices }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDevices.length) {
      const bounds = [];

      selectedDevices.forEach((deviceKey) => {
        const location = devices[deviceKey]?.location; 
        if (location) {
          const [lat, lon] = location.split(",").map((coord) => parseFloat(coord));
          bounds.push([lat, lon]);
        }
      });

      if (bounds.length) {
        map.fitBounds(bounds); 
      }
    }
  }, [selectedDevices, devices, map]);

  return (
    <>
      {selectedDevices.map((deviceKey) => {
        const location = devices[deviceKey]?.location;
        if (location) {
          const [lat, lon] = location.split(",").map((coord) => parseFloat(coord));
          return (
            <Marker key={deviceKey} position={[lat, lon]} icon={customIcon}>
              <Popup>Device Location: {location}</Popup>
            </Marker>
          );
        }
        return null;
      })}
    </>
  );
};

export default ComapanyData;
