import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { getDatabase, ref, get } from "firebase/database";
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Reports = () => {
    const [locationOptions, setLocationOptions] = useState([]);
    const [dateOptions, setDateOptions] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [locationDateMap, setLocationDateMap] = useState({});
    const [clientName, setClientName] = useState("");

    useEffect(() => {
        // Load data from browser memory (localStorage)
        const data = JSON.parse(localStorage.getItem("userData"));

        if (data) {
            // Set client name from data
            setClientName(data.username);

            if (data.devices) {
                const uniqueLocations = new Set();
                const locDateMap = {};

                data.devices.forEach(device => {
                    device.dates.forEach(dateObj => {
                        dateObj.times.forEach(timeObj => {
                            uniqueLocations.add(timeObj.coordinates);
                            // Build a map of location to available dates
                            if (!locDateMap[timeObj.coordinates]) {
                                locDateMap[timeObj.coordinates] = new Set();
                            }
                            locDateMap[timeObj.coordinates].add(dateObj.date);
                        });
                    });
                });

                // Set location options for react-select
                setLocationOptions(Array.from(uniqueLocations).map(location => ({ label: location, value: location })));
                
                // Convert locDateMap date sets to arrays for easy rendering
                const locDateMapArray = {};
                Object.keys(locDateMap).forEach(loc => {
                    locDateMapArray[loc] = Array.from(locDateMap[loc]);
                });
                setLocationDateMap(locDateMapArray);
            }
        }
    }, []);

    const handleLocationChange = (selectedOptions) => {
        setSelectedLocations(selectedOptions);

        if (selectedOptions.length > 0) {
            // Collect unique dates from selected locations
            const selectedLocs = selectedOptions.map(option => option.value);
            const availableDates = new Set();
            selectedLocs.forEach(loc => {
                locationDateMap[loc]?.forEach(date => availableDates.add(date));
            });
            setDateOptions(Array.from(availableDates).map(date => ({ label: date, value: date })));
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
            const formattedDates = selectedDates.map(date => date.value.replace(/-/g, ''));
    
            const db = getDatabase();
            const devicesRef = ref(db, 'devices');
    
            try {
                const snapshot = await get(devicesRef);
                if (snapshot.exists()) {
                    const devicesData = snapshot.val();
                    const matchingDevices = [];
    
                    // Iterate through devices to find matches
                    Object.keys(devicesData).forEach(deviceId => {
                        const device = devicesData[deviceId];
                        const deviceMatches = {
                            deviceId: deviceId,
                            dates: []
                        };
    
                        Object.keys(device).forEach(clientId => {
                            if (clientId === clientName) {
                                formattedDates.forEach(date => {
                                    if (device[clientId][date]) {
                                        const dateEntry = {
                                            date: `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`,
                                            locations: []
                                        };
    
                                        Object.keys(device[clientId][date]).forEach(time => {
                                            const entry = device[clientId][date][time];
    
                                            if (selectedLocations.some(location => location.value === entry.location.coordinates)) {
                                                const sensorData = {
                                                    ph: [],
                                                    tds: [],
                                                    turbidity: []
                                                };
    
                                                // Check if sensor_data exists and extract each sensor type
                                                if (entry.location.sensor_data) {
                                                    // Extract PH data
                                                    if (entry.location.sensor_data.ph) {
                                                        Object.entries(entry.location.sensor_data.ph).forEach(([timestamp, value]) => {
                                                            sensorData.ph.push({
                                                                time: timestamp,
                                                                value: value
                                                            });
                                                        });
                                                    }
    
                                                    // Extract TDS data
                                                    if (entry.location.sensor_data.tds) {
                                                        Object.entries(entry.location.sensor_data.tds).forEach(([timestamp, value]) => {
                                                            sensorData.tds.push({
                                                                time: timestamp,
                                                                value: value
                                                            });
                                                        });
                                                    }
    
                                                    // Extract Turbidity data
                                                    if (entry.location.sensor_data.turbidity) {
                                                        Object.entries(entry.location.sensor_data.turbidity).forEach(([timestamp, value]) => {
                                                            sensorData.turbidity.push({
                                                                time: timestamp,
                                                                value: value
                                                            });
                                                        });
                                                    }
                                                } else {
                                                    console.warn("No sensor_data found in entry:", entry);
                                                }
    
                                                dateEntry.locations.push({
                                                    time: time,
                                                    coordinates: entry.location.coordinates,
                                                    sensorData: sensorData
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
    
                    // Log matching device data with structured sensor readings to the console
                    console.log("Matching device data with structured sensor readings:", matchingDevices);
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error fetching data.");
            }
        }
    };
    
    
    
    

    

    return (
        <Container className="mt-4">
            <h2>Reports</h2>
            <h5>Client Name: {clientName}</h5>
            <Row className="my-3">
                <Col>
                    <label>Select Location(s):</label>
                    <Select
                        isMulti
                        options={locationOptions}
                        value={selectedLocations}
                        onChange={handleLocationChange}
                        placeholder="Select Locations..."
                    />
                </Col>
                <Col>
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
            <Button variant="primary" onClick={handleGetData}>Get Data</Button>
            <ToastContainer />
        </Container>
    );
}

export default Reports;
