/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { database } from "./firebase"; // Adjust the path if needed
import { ref, get } from "firebase/database";
import { Container, Row, Col, Card } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [deviceCount, setDeviceCount] = useState(0);
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Fetch total devices count and client stats on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch devices count
        const devicesRef = ref(database, "devices");
        const devicesSnapshot = await get(devicesRef);
        setDeviceCount(
          devicesSnapshot.exists()
            ? Object.keys(devicesSnapshot.val()).length
            : 0
        );

        // Fetch clients
        const membersRef = ref(database, "members");
        const membersSnapshot = await get(membersRef);
        if (membersSnapshot.exists()) {
          let totalClients = 0;
          let activeClients = 0;
          let inactiveClients = 0;
          const clientsList = [];

          membersSnapshot.forEach((childSnapshot) => {
            const clientData = childSnapshot.val();
            if (clientData.role === "Client") {
              totalClients++;
              if (clientData.status === "Active") {
                activeClients++;
                clientsList.push({
                  value: childSnapshot.key,
                  label: clientData.username,
                });
              } else if (clientData.status === "Inactive") {
                inactiveClients++;
              }
            }
          });

          setClients(clientsList);
          setClientStats({
            total: totalClients,
            active: activeClients,
            inactive: inactiveClients,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data.");
      }
    };

    fetchData();
  }, []);

  return (
    <Container className="mt-4">
      <ToastContainer />
      <Row className="mb-4">
        <Col md={6}>
          <Card
            className="text-center shadow-lg"
            style={{ backgroundColor: "#f8f9fa", borderColor: "#6c757d" }}
          >
            <Card.Body>
              <Card.Title
                className="text-primary"
                style={{ fontSize: "2rem", fontWeight: "bold" }}
              >
                Total Devices
              </Card.Title>
              <Card.Text
                className="fs-1 text-success"
                style={{
                  fontSize: "3rem",
                  fontWeight: "700",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                }}
              >
                {deviceCount}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card
            className="text-center shadow-lg"
            style={{ backgroundColor: "#f8f9fa", borderColor: "#6c757d" }}
          >
            <Card.Body>
              <Card.Title
                className="text-primary"
                style={{ fontSize: "2rem", fontWeight: "bold" }}
              >
                Total Clients
              </Card.Title>
              <Card.Text
                className="fs-1 text-success"
                style={{
                  fontSize: "3rem",
                  fontWeight: "700",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                }}
              >
                {clientStats.total}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <Card
            className="text-center shadow-lg"
            style={{ backgroundColor: "#f8f9fa", borderColor: "#6c757d" }}
          >
            <Card.Body>
              <Card.Title
                className="text-primary"
                style={{ fontSize: "2rem", fontWeight: "bold" }}
              >
                Active Clients
              </Card.Title>
              <Card.Text
                className="fs-1 text-success"
                style={{
                  fontSize: "3rem",
                  fontWeight: "700",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                }}
              >
                {clientStats.active}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card
            className="text-center shadow-lg"
            style={{ backgroundColor: "#f8f9fa", borderColor: "#6c757d" }}
          >
            <Card.Body>
              <Card.Title
                className="text-primary"
                style={{ fontSize: "2rem", fontWeight: "bold" }}
              >
                Inactive Clients
              </Card.Title>
              <Card.Text
                className="fs-1 text-success"
                style={{
                  fontSize: "3rem",
                  fontWeight: "700",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                }}
              >
                {clientStats.inactive}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
