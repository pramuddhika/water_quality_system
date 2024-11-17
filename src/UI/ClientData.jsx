/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { database } from "./firebase"; // Adjust the path to your firebase.js file
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const ClientData = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [locations, setLocations] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const membersRef = ref(database, "members");
        const clientQuery = query(
          membersRef,
          orderByChild("role"),
          equalTo("Client")
        );

        const snapshot = await get(clientQuery);
        if (snapshot.exists()) {
          const clientList = [];
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data.status === "Active") {
              clientList.push(data.username);
            }
          });
          setClients(clientList);
        } else {
          console.log("No clients available");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  const fetchLocationsAndDates = async () => {
    if (!selectedClient) {
      toast.error("Please select a client first!");
      return;
    }
  
    try {
      const devicesRef = ref(database, `devices`);
      const snapshot = await get(devicesRef);
  
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        const availableLocations = new Set();
        const availableDates = new Set();
  
        for (const [deviceId, clients] of Object.entries(devicesData)) {
          if (clients[selectedClient]) {
            const clientData = clients[selectedClient];
            for (const [dateKey, timesData] of Object.entries(clientData)) {
              availableDates.add(formatDate(dateKey));
  
              for (const [timeKey, timeDetails] of Object.entries(timesData)) {
                if (timeDetails.coordinates) {
                  availableLocations.add(timeDetails.coordinates);            
                }
              }
            }
          }
        }
  
        if (availableLocations.size === 0) {
          toast.warning("No locations found for the selected client.");
        }
        setLocations([...availableLocations]);
        setDates([...availableDates]);
      } else {
        toast.error("No data found for the selected client.");
      }
    } catch (error) {
      console.error("Error fetching locations and dates:", error);
    }
  };
  

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
    setLocations([]);
    setDates([]);
    setSelectedLocations([]);
    setSelectedDates([]);
  };

  const handleLocationChange = (selectedOptions) => {
    setSelectedLocations(selectedOptions || []);
  };

  const handleDateChange = (selectedOptions) => {
    setSelectedDates(selectedOptions || []);
  };

  const handleGetData = async () => {
    if (!selectedClient) {
      toast.error("Please select a client.");
      return;
    }
    if (selectedLocations.length === 0) {
      toast.error("Please select at least one location.");
      return;
    }
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date.");
      return;
    }
  
    const formattedDates = selectedDates.map(date => date.value.replace(/-/g, ""));
    const selectedLocs = selectedLocations.map(loc => loc.value);
  
    try {
      const devicesRef = ref(database, `devices`);
      const snapshot = await get(devicesRef);
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        const matchingData = [];
  
        for (const [deviceId, clients] of Object.entries(devicesData)) {
            if (clients[selectedClient]) {
              const clientData = clients[selectedClient];
          
              formattedDates.forEach((dateKey) => {
                if (clientData[dateKey]) {
                  const dateEntry = clientData[dateKey];
                  const location = dateEntry?.location;
          
                  if (location?.coordinates && selectedLocs.includes(location.coordinates)) {
                    const sensorData = location.sensor_data || {};
                    
                    matchingData.push({
                      deviceId,
                      date: formatDate(dateKey),
                      coordinates: location.coordinates,
                      ph: sensorData.ph || {},
                      tds: sensorData.tds || {},
                      turbidity: sensorData.turbidity || {},
                    });
                  }
                }
              });
            }
          }
          
  
        exportToCSV(matchingData);
      } else {
        toast.error("No data found for the selected criteria.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  const exportToCSV = (data) => {
    const csvRows = [];
    csvRows.push("Device ID,Date,Coordinates,Coordinates,PH Time,PH Value,TDS Time,TDS Value,Turbidity Time,Turbidity Value");

    data.forEach(entry => {
      const maxLength = Math.max(
        Object.keys(entry.ph).length,
        Object.keys(entry.tds).length,
        Object.keys(entry.turbidity).length
      );

      for (let i = 0; i < maxLength; i++) {
        const phEntry = Object.entries(entry.ph)[i] || ["", ""];
        const tdsEntry = Object.entries(entry.tds)[i] || ["", ""];
        const turbidityEntry = Object.entries(entry.turbidity)[i] || ["", ""];

        csvRows.push([
          entry.deviceId,
          entry.date,
          entry.coordinates,
          phEntry[0], phEntry[1],
          tdsEntry[0], tdsEntry[1],
          turbidityEntry[0], turbidityEntry[1]
        ].join(","));
      }
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sensor_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  return (
    <Container className="mt-4">
      <ToastContainer />
      <Row>
        <Form>
          <div className="flex items-center gap-2">
            <Form.Group controlId="clientSelect" className="mb-3 col-6">
              <Form.Label>Select Client</Form.Label>
              <Form.Control
                as="select"
                value={selectedClient}
                onChange={handleClientChange}
              >
                <option value="">-- Select a Client --</option>
                {clients.map((client, index) => (
                  <option key={index} value={client}>
                    {client}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button
              variant="primary"
              className="mb-3 mt-8"
              onClick={fetchLocationsAndDates}
              disabled={!selectedClient}
            >
              Get Locations and Dates
            </Button>
          </div>

          <div className="flex gap-2">
            <Form.Group controlId="locationSelect" className="mb-3 col-6">
              <Form.Label>Select Location(s)</Form.Label>
              <Select
                isMulti
                options={locations.map((location) => ({
                  value: location,
                  label: location,
                }))}
                value={selectedLocations}
                onChange={handleLocationChange}
                isDisabled={locations.length === 0}
              />
            </Form.Group>
            <Form.Group controlId="dateSelect" className="mb-3 col-6">
              <Form.Label>Select Date(s)</Form.Label>
              <Select
                isMulti
                options={dates.map((date) => ({
                  value: date,
                  label: date,
                }))}
                value={selectedDates}
                onChange={handleDateChange}
                isDisabled={dates.length === 0}
              />
            </Form.Group>
          </div>
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={handleGetData}
              disabled={!selectedClient}
            >
              Download CSV
            </Button>
          </div>
        </Form>
      </Row>
    </Container>
  );
};

export default ClientData;
