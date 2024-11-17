import { useState, useEffect } from "react";
import { ref, get, child } from "firebase/database";
import { database } from "./firebase";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const parseCoordinates = (coordinates) => {
  const [lat, lon] = coordinates.split(",");
  return { lat: parseFloat(lat), lon: parseFloat(lon) };
};

const SensorData = () => {
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lon: 0 });
  const userData = localStorage.getItem("userData");
  const currentUser = JSON.parse(userData);

  // Function to format the date in yyyy-mm-dd format
  const formatDate = (dateString) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchDevices = async () => {
      const dbRef = ref(database);
      try {
        const snapshot = await get(child(dbRef, "devices"));
        if (snapshot.exists()) {
          const devicesData = snapshot.val();
          const clientDevices = [];

          for (const [deviceId, clients] of Object.entries(devicesData)) {
            if (currentUser.username in clients) {
              const datesData = clients[currentUser.username];

              // Sort dates in descending order
              const sortedDates = Object.keys(datesData)
                .sort((a, b) => new Date(b) - new Date(a)) // Parse date strings for sorting
                .map(dateKey => {
                  const formattedDate = formatDate(dateKey);
                  const locationData = datesData[dateKey];

                  return { date: formattedDate, location: locationData.location?.coordinates };
                });

              clientDevices.push({ deviceId, dates: sortedDates });
            }
          }

          setDevices(clientDevices);
          const updatedUserData = { ...currentUser, devices: clientDevices };
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
        }
      } catch (error) {
        console.error("Error fetching devices: ", error);
      }
    };
    fetchDevices();
  }, [currentUser.username]);

  const handleViewLocation = (coordinates) => {
    const parsedLocation = parseCoordinates(coordinates);
    setLocation(parsedLocation);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center gap-5 mt-4">
        <p className="font-bold ml-3">Your devices list</p>
        <input
          type="text"
          id="deviceName"
          className="border border-gray-200 rounded-lg p-2 w-[800px] mt-1 focus:outline-none"
          placeholder={
            devices.length > 0
              ? devices.map(device => `${device.deviceId}`).join(" | ")
              : "No devices found"
          }
          aria-label="Device Name"
          readOnly
        />
      </div>

      <div className="mt-10">
        <p className="font-bold mb-3">Device Usage Summary</p>
        <div className="table-responsive">
          <Table bordered striped hover>
            <thead className="bg-gray-200">
              <tr>
                <th>Device Id</th>
                <th>Date</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device =>
                device.dates.map(date => (
                  <tr key={`${device.deviceId}-${date.date}`}>
                    <td>{device.deviceId}</td>
                    <td>{date.date}</td>
                    <td className="flex justify-between">
                      {date.location}
                      <button
                        onClick={() => handleViewLocation(date.location)}
                        className="text-end ml-2"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Device Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MapContainer
            center={[location.lat, location.lon]}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={[location.lat, location.lon]} />
          </MapContainer>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SensorData;
