import { NavLink } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

const SideNav = () => {
  return (
    <Navbar bg="dark" variant="dark" className="flex-column p-4 text-white position-fixed h-100" style={{ width: "180px" }}>
      <Navbar.Brand className="mb-4">
        <h1 className="h5">Water Quality</h1>
        <h2 className="small">System</h2>
      </Navbar.Brand>

      <Nav className="flex-column flex-grow-1">
        <Nav.Item className="my-3">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? "text-info" : "text-white"}
          >
            Dashboard
          </NavLink>
        </Nav.Item>
        
        <Nav.Item className="my-3">
          <NavLink 
            to="/data-visualization" 
            className={({ isActive }) => isActive ? "text-info" : "text-white"}
          >
            Data Visualization
          </NavLink>
        </Nav.Item>
        
        <Nav.Item className="my-3">
          <NavLink 
            to="/company-data" 
            className={({ isActive }) => isActive ? "text-info" : "text-white"}
          >
            Company Data
          </NavLink>
        </Nav.Item>
        
        <Nav.Item className="my-3">
          <NavLink 
            to="/members" 
            className={({ isActive }) => isActive ? "text-info" : "text-white"}
          >
            Members
          </NavLink>
        </Nav.Item>
        
        <Nav.Item className="my-3">
          <NavLink 
            to="/reports" 
            className={({ isActive }) => isActive ? "text-info" : "text-white"}
          >
            Reports
          </NavLink>
        </Nav.Item>
      </Nav>

      <Nav className="mt-auto">
        <Nav.Item className="my-4">
          <NavLink to="/" className="text-white">Logout</NavLink>
        </Nav.Item>
      </Nav>
    </Navbar>
  );
};

export default SideNav;
