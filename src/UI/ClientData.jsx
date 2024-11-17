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
          if (selectedClient in clients) {
            const clientData = clients[selectedClient];
            for (const [dateKey, timesData] of Object.entries(clientData)) {
              availableDates.add(formatDate(dateKey));
              for (const [timeKey, timeDetails] of Object.entries(timesData)) {
                if (timeDetails.location && timeDetails.location.coordinates) {
                  availableLocations.add(timeDetails.location.coordinates);
                }
              }
            }
          }
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
    if (selectedLocations.length === 0) {
      toast.error("Please select a location first!");
      return;
    }
    setSelectedDates(selectedOptions || []);
  };

  const handleGetData = () => {
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

    console.log("Selected Client:", selectedClient);
    console.log(
      "Selected Locations:",
      selectedLocations.map((loc) => loc.value)
    );
    console.log(
      "Selected Dates:",
        selectedDates.map(date => date.value.replace(/-/g, ''))
    );
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
              Get Data
            </Button>
          </div>
        </Form>
      </Row>
    </Container>
  );
};

export default ClientData;
