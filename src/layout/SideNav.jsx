import { NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";

const SideNav = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("userData");
  const currentUser = JSON.parse(userData);

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("userData");

    // Navigate to login page
    navigate("/");
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      className="flex-column p-4 text-white position-fixed h-100"
      style={{ width: "180px" }}
    >
      <Navbar.Brand className="mb-4">
        <h1 className="h5">Water Quality</h1>
        <h2 className="small">System</h2>
      </Navbar.Brand>

      <Nav className="flex-column flex-grow-1">
        {currentUser.role === "Admin" && (
          <Nav.Item className="my-3">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "text-info" : "text-white"
              }
            >
              Dashboard
            </NavLink>
          </Nav.Item>
        )}

        {currentUser.role === "Client" && (
          <Nav.Item className="my-3">
            <NavLink
              to="/sensor-data"
              className={({ isActive }) =>
                isActive ? "text-info" : "text-white"
              }
            >
              Sensor Data
            </NavLink>
          </Nav.Item>
        )}

        {currentUser.role === "Client" && (
          <Nav.Item className="my-3">
            <NavLink
              to="/data-visualization"
              className={({ isActive }) =>
                isActive ? "text-info" : "text-white"
              }
            >
              DataVisualization
            </NavLink>
          </Nav.Item>
        )}

        {currentUser.role === "Admin" && (
          <Nav.Item className="my-3">
            <NavLink
              to="/members"
              className={({ isActive }) =>
                isActive ? "text-info" : "text-white"
              }
            >
              Members
            </NavLink>
          </Nav.Item>
        )}

        {currentUser.role === "Client" && (
          <Nav.Item className="my-3">
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                isActive ? "text-info" : "text-white"
              }
            >
              Reports
            </NavLink>
          </Nav.Item>
        )}

        <Nav.Item className="my-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "text-info" : "text-white"
            }
          >
            Setting
          </NavLink>
        </Nav.Item>
      </Nav>

      <Nav className="mt-auto">
        <Nav.Item className="my-4">
          <span
            onClick={handleLogout}
            className="text-white"
            style={{ cursor: "pointer" }}
          >
            Logout
          </span>
        </Nav.Item>
      </Nav>
    </Navbar>
  );
};

export default SideNav;
