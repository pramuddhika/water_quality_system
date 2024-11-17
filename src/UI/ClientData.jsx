import { useEffect, useState } from "react";
import { database } from "./firebase"; // Adjust the path to your firebase.js file
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const ClientData = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

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

  const handleClientChange = (event) => {
    setSelectedClient(event.target.value);
  };

  const handleGetSensorData = () => {
    if (selectedClient) {
      console.log("Selected Client Username:", selectedClient);
    } else {
      console.log("No client selected");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="">
        <Col md={6} >
          <Form>
            <Form.Group controlId="clientSelect" className="mb-3">
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
              onClick={handleGetSensorData}
              disabled={!selectedClient}
            >
              Get Sensor Data
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ClientData;
