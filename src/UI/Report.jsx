import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
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

    const handleGetData = () => {
        if (selectedLocations.length === 0) {
            toast.warning("Please select at least one location.");
        } else if (selectedDates.length === 0) {
            toast.warning("Please select at least one date.");
        } else {
            // Format data for the POST request
            const requestData = {
                clientName: clientName,
                selectedLocations: selectedLocations.map(location => location.value),
                selectedDates: selectedDates.map(date => date.value),
            };

            // Log final formatted data for POST request
            console.log(requestData);

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
