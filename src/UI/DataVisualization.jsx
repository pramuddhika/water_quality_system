import { useState, useEffect } from "react";
import Select from "react-select";
import { Button, Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { getDatabase, ref, get } from "firebase/database";
import { Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DataVisualization = () => {
  const [locationOptions, setLocationOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [locationDateMap, setLocationDateMap] = useState({});
  const [data, setData] = useState(null);
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (storedData) {
      setClientName(storedData.username);
      if (storedData.devices) {
        const uniqueLocations = new Set();
        const locDateMap = {};

        storedData.devices.forEach((device) => {
          device.dates.forEach((dateObj) => {
              uniqueLocations.add(dateObj.location);
              if (!locDateMap[dateObj.location]) {
                locDateMap[dateObj.location] = new Set();
              }
              locDateMap[dateObj.location].add(dateObj.date);
          });
        });

        setLocationOptions(
          Array.from(uniqueLocations).map((location) => ({
            label: location,
            value: location,
          }))
        );

        const locDateMapArray = {};
        Object.keys(locDateMap).forEach((loc) => {
          locDateMapArray[loc] = Array.from(locDateMap[loc]);
        });
        setLocationDateMap(locDateMapArray);
      }
    }
  }, []);

  const handleLocationChange = (selectedOptions) => {
    setSelectedLocations(selectedOptions);
    if (selectedOptions.length > 0) {
      const selectedLocs = selectedOptions.map((option) => option.value);
      const availableDates = new Set();
      selectedLocs.forEach((loc) => {
        locationDateMap[loc]?.forEach((date) => availableDates.add(date));
      });
      setDateOptions(
        Array.from(availableDates).map((date) => ({ label: date, value: date }))
      );
    } else {
      setDateOptions([]);
      setSelectedDates([]);
    }
  };

  const handleGetData = async () => {
    if (selectedLocations.length === 0) {
      toast.warning("Please select at least one location.");
    } else if (selectedDates.length === 0) {
      toast.warning("Please select at least one date.");
    } else {
      const formattedDates = selectedDates.map((date) =>
        date.value.replace(/-/g, "")
      );
      const db = getDatabase();
      const devicesRef = ref(db, "devices");

      try {
        const snapshot = await get(devicesRef);
        if (snapshot.exists()) {
          const devicesData = snapshot.val();
          const matchingDevices = [];
          Object.keys(devicesData).forEach((deviceId) => {
            const device = devicesData[deviceId];
            const deviceMatches = {
              deviceId: deviceId,
              dates: [],
            };

            Object.keys(device).forEach((clientId) => {
              if (clientId === clientName) {
                formattedDates.forEach((date) => {
                  if (device[clientId][date]) {
                    const dateEntry = {
                      date: `${date.slice(0, 4)}.${date.slice(
                        4,
                        6
                      )}.${date.slice(6, 8)}`,
                      locations: [],
                    };

                    Object.keys(device[clientId][date]).forEach(() => {
                      const entry = device[clientId][date];
                      if (
                        selectedLocations.some(
                          (location) =>
                            location.value === entry.location.coordinates
                        )
                      ) {
                        const sensorData = {
                          ph: [],
                          tds: [],
                          turbidity: [],
                        };

                        if (entry.location.sensor_data) {
                          if (entry.location.sensor_data.ph) {
                            Object.entries(
                              entry.location.sensor_data.ph
                            ).forEach(([timestamp, value]) => {
                              sensorData.ph.push({
                                time: timestamp,
                                value: value,
                              });
                            });
                          }
                          if (entry.location.sensor_data.tds) {
                            Object.entries(
                              entry.location.sensor_data.tds
                            ).forEach(([timestamp, value]) => {
                              sensorData.tds.push({
                                time: timestamp,
                                value: value,
                              });
                            });
                          }
                          if (entry.location.sensor_data.turbidity) {
                            Object.entries(
                              entry.location.sensor_data.turbidity
                            ).forEach(([timestamp, value]) => {
                              sensorData.turbidity.push({
                                time: timestamp,
                                value: value,
                              });
                            });
                          }
                        }

                        dateEntry.locations.push({
                          coordinates: entry.location.coordinates,
                          sensorData: sensorData,
                        });
                      }
                    });

                    if (dateEntry.locations.length > 0) {
                      deviceMatches.dates.push(dateEntry);
                    }
                  }
                });
              }
            });

            if (deviceMatches.dates.length > 0) {
              matchingDevices.push(deviceMatches);
            }
          });

          setData(matchingDevices);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data.");
      }
    }
  };

  const getOverallSensorStats = () => {
    if (!data || data.length === 0) {
      return {
        ph: "N/A",
        tds: "N/A",
        turbidity: "N/A",
        sensorCount: 0,
      };
    }
  
    const phValues = [];
    const tdsValues = [];
    const turbidityValues = [];
    let sensorCount = 0;
  
    data.forEach((device) =>
      device.dates.forEach((dateEntry) =>
        dateEntry.locations.forEach((location) => {
          location.sensorData.ph.forEach(({ value }) => phValues.push(value));
          location.sensorData.tds.forEach(({ value }) =>
            tdsValues.push(value)
          );
          location.sensorData.turbidity.forEach(({ value }) =>
            turbidityValues.push(value)
          );
          sensorCount += 1;
        })
      )
    );
  
    const avg = (arr) =>
      arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : "N/A";
  
    return {
      ph: avg(phValues),
      tds: avg(tdsValues),
      turbidity: avg(turbidityValues),
      sensorCount: sensorCount,
    };
  };
  

  const renderSensorChart = (sensorType) => {
    const labels = [];
    const dataPoints = [];

    data.forEach((device) =>
      device.dates.forEach((dateEntry) =>
        dateEntry.locations.forEach((location) => {
          location.sensorData[sensorType].forEach((sensor) => {
            labels.push(sensor.time);
            dataPoints.push(sensor.value);
          });
        })
      )
    );

    const chartData = {
      labels,
      datasets: [
        {
          label: `${sensorType.toUpperCase()} over Time`,
          data: dataPoints,
          fill: false,
          backgroundColor: "rgb(75, 192, 192)",
          borderColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    };

    return <Line data={chartData} options={{ responsive: true }} />;
  };

  const overallStats = getOverallSensorStats();

  return (
    <Container className="mt-4">
      {/* Filter Section */}
      <Row className="my-3">
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <label>Select Location(s):</label>
          <Select
            isMulti
            options={locationOptions}
            value={selectedLocations}
            onChange={handleLocationChange}
            placeholder="Select Locations..."
          />
        </Col>
        <Col xs={12} md={6}>
          <label>Select Date(s):</label>
          <Select
            isMulti
            options={dateOptions}
            value={selectedDates}
            onChange={setSelectedDates}
            placeholder="Select Dates..."
            isDisabled={selectedLocations.length === 0}
          />
        </Col>
      </Row>

      {/* Get Data Button */}
      <Row className="mb-4">
        <Col className="text-center">
          <Button variant="primary" onClick={handleGetData}>
            Get Data
          </Button>
        </Col>
      </Row>

      {/* Data Display Section */}
      {data && (
        <>
          {/* Overall Sensor Summary */}
          <Row className="mt-5">
            <Col xs={12} lg={6} className="mb-4 mb-lg-0">
              <h4 className="mb-3 font-bold text-xl lg:text-2xl">
                Overall Sensor Summary
              </h4>
              <div className="flex items-center justify-center">
                <div>
                  <p className="mb-4 mt-4">
                    <strong>Sensor Count:</strong> {overallStats.sensorCount}
                  </p>
                  <p className="mb-4">
                    <strong>Average pH:</strong> {overallStats.ph}
                  </p>
                  <p className="mb-4">
                    <strong>Average TDS:</strong> {overallStats.tds}
                  </p>
                  <p>
                    <strong>Average Turbidity:</strong>{" "}
                    {overallStats.turbidity}
                  </p>
                </div>
              </div>
            </Col>

            {/* pH Chart */}
            <Col xs={12} lg={6}>
              <h4 className="text-center text-lg lg:text-xl">pH Levels Over Time</h4>
              {renderSensorChart("ph")}
            </Col>
          </Row>

          {/* Other Charts */}
          <Row className="mt-5">
            <Col xs={12} lg={6} className="mb-4 mb-lg-0">
              <h4 className="text-center text-lg lg:text-xl">TDS Levels Over Time</h4>
              {renderSensorChart("tds")}
            </Col>
            <Col xs={12} lg={6}>
              <h4 className="text-center text-lg lg:text-xl">
                Turbidity Levels Over Time
              </h4>
              {renderSensorChart("turbidity")}
            </Col>
          </Row>
        </>
      )}

      <ToastContainer />
    </Container>
  );
};

export default DataVisualization;
