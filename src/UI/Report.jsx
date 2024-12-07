import { useState, useEffect } from "react";
import Select from "react-select";
import { Button, Container, Row, Col, Table } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { getDatabase, ref, get } from "firebase/database";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Chart from "chart.js/auto";
import * as tf from "@tensorflow/tfjs";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";

const Reports = () => {
  const [locationOptions, setLocationOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [locationDateMap, setLocationDateMap] = useState({});
  const [clientName, setClientName] = useState("");
  const [processedData, setProcessedData] = useState([]);
  const [svmPredictions, setSvmPredictions] = useState([]);
  const [treePredictions, setTreePredictions] = useState([]);
  const [matchingDevices, setmatchingDevices] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [accuracies, setAccuracies] = useState({ svm: 0, tree: 0, knn: 0 });
  const [visualizeClicked, setVisualizeClicked] = useState(false);

  Chart.register(MatrixController, MatrixElement);

  useEffect(() => {
    // Load data from browser memory (localStorage)
    const data = JSON.parse(localStorage.getItem("userData"));

    if (data) {
      // Set client name from data
      setClientName(data.username);

      if (data.devices) {
        const uniqueLocations = new Set();
        const locDateMap = {};

        data.devices.forEach((device) => {
          device.dates.forEach((dateObj) => {
            // Add location to the set of unique locations
            uniqueLocations.add(dateObj.location);

            // Build a map of location to available dates
            if (!locDateMap[dateObj.location]) {
              locDateMap[dateObj.location] = new Set();
            }
            locDateMap[dateObj.location].add(dateObj.date);
          });
        });

        // Set location options for react-select
        setLocationOptions(
          Array.from(uniqueLocations).map((location) => ({
            label: location,
            value: location,
          }))
        );

        // Convert locDateMap date sets to arrays for easy rendering
        const locDateMapArray = {};
        Object.keys(locDateMap).forEach((loc) => {
          locDateMapArray[loc] = Array.from(locDateMap[loc]);
        });
        setLocationDateMap(locDateMapArray);
      }
    }
  }, []);

  useEffect(() => {
    if (matchingDevices.length > 0) {
      runPredictions();
    }
  }, [matchingDevices]);

  useEffect(() => {
    if (visualizeClicked === true) { 
      plotCharts();
    }    
   }, [visualizeClicked]);

  const handleLocationChange = (selectedOptions) => {
    setSelectedLocations(selectedOptions);

    if (selectedOptions.length > 0) {
      // Collect unique dates from selected locations
      const selectedLocs = selectedOptions.map((option) => option.value);
      const availableDates = new Set();
      selectedLocs.forEach((loc) => {
        locationDateMap[loc]?.forEach((date) => availableDates.add(date));
      });
      setDateOptions(
        Array.from(availableDates).map((date) => ({ label: date, value: date }))
      );
    } else {
      // Clear date options if no location is selected
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
      // Convert selected dates to YYYYMMDD format
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

          // Iterate through devices to find matches
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

                        // Check if sensor_data exists and extract each sensor type
                        if (entry.location.sensor_data) {
                          // Extract PH data
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

                          // Extract TDS data
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

                          // Extract Turbidity data
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

                    // Only add the date if there are matching locations
                    if (dateEntry.locations.length > 0) {
                      deviceMatches.dates.push(dateEntry);
                    }
                  }
                });
              }
            });

            // Only add the device if there are matching dates
            if (deviceMatches.dates.length > 0) {
              matchingDevices.push(deviceMatches);
            }
          });
          setmatchingDevices(matchingDevices);
          // Convert matchingDevices to CSV and download
          preprocessData(matchingDevices);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data.");
      }
    }
  };

  const CSVexport = () => {
    if (matchingDevices.length === 0) {
      toast.warning("No data to export");
      return;
    } else {
      exportToCSV(matchingDevices);
    }
  };

  // Helper function to convert data to CSV and trigger download
  const exportToCSV = (data) => {
    const csvRows = [];

    // Define headers
    csvRows.push(
      "Device ID,Date,Coordinates,Coordinates,PH Time,PH Value,TDS Time,TDS Value,Turbidity Time,Turbidity Value"
    );

    // Loop through data to format each row
    data.forEach((device) => {
      device.dates.forEach((dateEntry) => {
        dateEntry.locations.forEach((location) => {
          const { coordinates, sensorData } = location;

          // Generate rows for each sensor data type
          const maxLength = Math.max(
            sensorData.ph.length,
            sensorData.tds.length,
            sensorData.turbidity.length
          );
          for (let i = 0; i < maxLength; i++) {
            const ph = sensorData.ph[i] || { time: "", value: "" };
            const tds = sensorData.tds[i] || { time: "", value: "" };
            const turbidity = sensorData.turbidity[i] || {
              time: "",
              value: "",
            };

            csvRows.push(
              [
                device.deviceId,
                dateEntry.date,
                coordinates,
                ph.time,
                ph.value,
                tds.time,
                tds.value,
                turbidity.time,
                turbidity.value,
              ].join(",")
            );
          }
        });
      });
    });

    // Convert rows to a single CSV string
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a download link and click it programmatically
    const link = document.createElement("a");
    link.href = url;
    link.download = "sensor_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const preprocessData = (rawData) => {
    const rows = [];
    rawData?.forEach((device) => {
      device.dates?.forEach((date) => {
        date.locations?.forEach((location) => {
          location.sensorData.ph?.forEach((ph, index) => {
            rows.push({
              deviceId: device.deviceId,
              date: date.date,
              coordinates: location.coordinates,
              ph: ph.value,
              tds: location.sensorData.tds[index]?.value || 0,
              turbidity: location.sensorData.turbidity[index]?.value || 0,
            });
          });
        });
      });
    });
    setProcessedData(rows);
  };

  const runPredictions = async () => {
    if (processedData.length === 0) {
      toast.warning("No data to process");
      return;
    }

    // Prepare training and testing data
    const features = processedData.map((d) => [d.ph, d.tds, d.turbidity]);
    const labels = processedData.map(
      (d) =>
        d.ph > 7.5 || d.turbidity > 7
          ? 2 // Unsafe
          : d.ph >= 6.5 && d.turbidity >= 3.5
          ? 1 // Moderate
          : 0 // Safe
    );

    // One-hot encode labels
    const oneHotLabels = tf.oneHot(tf.tensor1d(labels, "int32"), 3);

    // Convert features to tensors
    const featureTensor = tf.tensor2d(features);

    const results = {
      SVM: { predictions: [], accuracy: 0 },
      DecisionTree: { predictions: [], accuracy: 0 },
      KNN: { predictions: [], accuracy: 0 },
    };

    // Train SVM model
    const svmModel = tf.sequential();
    svmModel.add(
      tf.layers.dense({
        inputShape: [features[0].length],
        units: 3,
        activation: "softmax",
      })
    );
    svmModel.compile({
      optimizer: tf.train.adam(),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
    const svmHistory = await svmModel.fit(featureTensor, oneHotLabels, {
      epochs: 50,
      batchSize: 32,
    });
    results.SVM.predictions = await svmModel
      .predict(featureTensor)
      .argMax(-1)
      .array();
    results.SVM.accuracy = svmHistory.history.acc[svmHistory.epoch.length - 1];

    // Train Decision Tree model
    const treeModel = tf.sequential();
    treeModel.add(
      tf.layers.dense({
        inputShape: [features[0].length],
        units: 3,
        activation: "softmax",
      })
    );
    treeModel.compile({
      optimizer: tf.train.adam(),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
    const treeHistory = await treeModel.fit(featureTensor, oneHotLabels, {
      epochs: 50,
      batchSize: 32,
    });
    results.DecisionTree.predictions = await treeModel
      .predict(featureTensor)
      .argMax(-1)
      .array();
    results.DecisionTree.accuracy =
      treeHistory.history.acc[treeHistory.epoch.length - 1];

    setSvmPredictions(results.SVM.predictions);
    setTreePredictions(results.DecisionTree.predictions);

    setAccuracies({
      svm: results.SVM.accuracy,
      tree: results.DecisionTree.accuracy,
    });

    toast.success("Data Loaded!");
  };

  const plotCharts = () => {
    setVisualizeClicked(true);
    plotHistograms();
    if (svmPredictions.length === 0 || treePredictions.length === 0) {
      toast.warning("No data to visualize");
      return;
    }

    const chartConfigs = [
      {
        id: "svmChart",
        title: "SVM Predictions",
        predictions: svmPredictions,
        accuracy: accuracies.svm,
      },
      {
        id: "treeChart",
        title: "Decision Tree Predictions",
        predictions: treePredictions,
        accuracy: accuracies.tree,
      },
    ];

    chartConfigs.forEach(({ id, title, predictions, accuracy }) => {
      const counts = { Safe: 0, Moderate: 0, Unsafe: 0 };
      predictions.forEach((p) => {
        if (p === 0) counts.Safe++;
        else if (p === 1) counts.Moderate++;
        else if (p === 2) counts.Unsafe++;
      });

      new Chart(document.getElementById(id), {
        type: "bar",
        data: {
          labels: Object.keys(counts),
          datasets: [
            {
              label: title,
              data: Object.values(counts),
              backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
            },
          ],
        },
      });

      document.getElementById(`${id}Accuracy`).textContent = `Accuracy: ${(
        accuracy * 100
      ).toFixed(2)}%`;
    });
    plotHeatMap();
    calculateStatistics();
  };

  const plotHistograms = () => {
    ["ph", "tds", "turbidity"].forEach((key) => {
      new Chart(document.getElementById(`${key}-histogram`), {
        type: "bar",
        data: {
          labels: processedData.map((_, i) => i + 1),
          datasets: [
            {
              label: key,
              data: processedData.map((d) => d[key]),
            },
          ],
        },
      });
    });
  };

  const plotHeatMap = () => {
    if (!processedData || processedData.length === 0) {
      toast.warning("No data available for heat map");
      return;
    }

    ["ph", "tds", "turbidity"].forEach((key, index) => {
      const heatMapData = processedData.map((d, i) => ({
        x: i + 1, // Sample index
        y: index + 1, // Row index for sensor type
        v: d[key], // Sensor value
      }));

      const ctx = document.getElementById(`${key}-heatmap`);
      if (ctx) {
        new Chart(ctx, {
          type: "matrix",
          data: {
            datasets: [
              {
                label: `${key} Heat Map`,
                data: heatMapData,
                backgroundColor(ctx) {
                  const value = ctx.raw.v;
                  return value > 7
                    ? "#F44336" // High intensity
                    : value > 3.5
                    ? "#FFC107" // Moderate intensity
                    : "#4CAF50"; // Low intensity
                },
                width(ctx) {
                  return ctx.chart.chartArea
                    ? ctx.chart.chartArea.width / processedData.length
                    : 0;
                },
                height(ctx) {
                  return ctx.chart.chartArea
                    ? ctx.chart.chartArea.height / 3
                    : 0; // Dividing equally for 3 sensors
                },
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: "linear",
                title: { display: true, text: "Sample Index" },
                min: 1,
                max: processedData.length,
              },
              y: {
                type: "linear",
                ticks: {
                  callback(value) {
                    return ["ph", "tds", "turbidity"][value - 1]; // Map row index to sensor type
                  },
                },
                title: { display: true, text: "Sensor Type" },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label(ctx) {
                    return `Value: ${ctx.raw.v}`;
                  },
                },
              },
            },
          },
        });
      } else {
        console.error(`Canvas with ID ${key}-heatmap not found.`);
      }
    });
  };

  const resetData = () => {
    if (
      processedData.length === 0 &&
      svmPredictions.length === 0 &&
      treePredictions.length === 0 &&
      matchingDevices.length === 0
    ) {
      toast.warning("No data to reset");
      return;
    } else {
      toast.success("Data reset");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  const calculateStatistics = () => {
    const sensorKeys = ["ph", "tds", "turbidity"];
    const stats = sensorKeys.map((key) => {
      const values = processedData.map((data) => data[key]).filter(Boolean);
      if (values.length === 0) return { key, stats: null };
      const sortedValues = [...values].sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      const std =
        Math.sqrt(
          values.reduce((acc, val) => acc + (val - mean) ** 2, 0) /
            values.length
        ) || 0;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const median =
        sortedValues.length % 2 === 0
          ? (sortedValues[sortedValues.length / 2 - 1] +
              sortedValues[sortedValues.length / 2]) /
            2
          : sortedValues[Math.floor(sortedValues.length / 2)];
      const q25 = sortedValues[Math.floor(sortedValues.length * 0.25)];
      const q75 = sortedValues[Math.floor(sortedValues.length * 0.75)];
      return {
        key,
        stats: {
          count: values.length,
          mean: mean.toFixed(2),
          std: std.toFixed(2),
          min,
          q25,
          median,
          q75,
          max,
        },
      };
    });
    setStatistics(stats);
  };

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
            isDisabled={selectedLocations.length === 0} // Disable until location is selected
          />
        </Col>
      </Row>

      {/* Get Data Button */}
      <Row className="mb-3">
        <Col className="text-center">
          <Button variant="primary" onClick={handleGetData}>
            Get Data
          </Button>
        </Col>
      </Row>

      {/* Actions Section */}
      {matchingDevices.length > 0 && (
        <Row className="mb-4 text-center">
          <Col xs={12} md={4} className="mb-3 mb-md-0">
            <Button onClick={CSVexport} variant="secondary" className="w-100">
              Download CSV
            </Button>
          </Col>
          <Col xs={12} md={4} className="mb-3 mb-md-0">
            <Button onClick={plotCharts} variant="secondary" className="w-100">
              Visualize Results
            </Button>
          </Col>
          <Col xs={12} md={4}>
            <Button onClick={resetData} variant="secondary" className="w-100">
              Reset Data
            </Button>
          </Col>
        </Row>
      )}

      {/* Visualization Section */}
      {visualizeClicked && (
        <>
          <Row className="mt-3">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <canvas id="svmChart"></canvas>
              <p id="svmChartAccuracy"></p>
            </Col>
            <Col xs={12} md={6}>
              <canvas id="treeChart"></canvas>
              <p id="treeChartAccuracy"></p>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12}>
              <p className="text-center">Histograms of Sensor Data</p>
            </Col>
            <Col xs={12} md={4} className="mb-3 mb-md-0">
              <canvas id="ph-histogram"></canvas>
            </Col>
            <Col xs={12} md={4} className="mb-3 mb-md-0">
              <canvas id="tds-histogram"></canvas>
            </Col>
            <Col xs={12} md={4}>
              <canvas id="turbidity-histogram"></canvas>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12}>
              <p className="text-center">Heat Maps of Sensor Data</p>
            </Col>
            <Col xs={12} md={4} className="mb-3 mb-md-0">
              <canvas id="ph-heatmap"></canvas>
            </Col>
            <Col xs={12} md={4} className="mb-3 mb-md-0">
              <canvas id="tds-heatmap"></canvas>
            </Col>
            <Col xs={12} md={4}>
              <canvas id="turbidity-heatmap"></canvas>
            </Col>
          </Row>
        </>
      )}

      {/* Statistics Section */}
      {statistics && (
        <Row className="mt-4">
          <Col xs={12}>
            <h4 className="text-center mb-3">Sensor Data Summary</h4>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Count</th>
                  <th>Mean</th>
                  <th>Std</th>
                  <th>Min</th>
                  <th>25%</th>
                  <th>50%</th>
                  <th>75%</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map(({ key, stats }) => (
                  <tr key={key}>
                    <td>{key}</td>
                    {stats ? (
                      <>
                        <td>{stats.count}</td>
                        <td>{stats.mean}</td>
                        <td>{stats.std}</td>
                        <td>{stats.min}</td>
                        <td>{stats.q25}</td>
                        <td>{stats.median}</td>
                        <td>{stats.q75}</td>
                        <td>{stats.max}</td>
                      </>
                    ) : (
                      <td colSpan="8" className="text-center">
                        No Data
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}

      <ToastContainer />
    </Container>
  );
};

export default Reports;
