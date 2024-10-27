import { NavLink } from 'react-router-dom';

const SideNav = () => {
  return (
    <nav className="flex flex-col h-full p-4 bg-gray-800 text-white fixed" style={{ width: "180px" }}>
      <div className="flex-1">
        <h1 className="text-base lg:text-xl font-bold">Water Quality</h1>
        <h2 className="text-sm text-end"> System</h2>
        <ul>
          <li className="mt-12 mb-4">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? "text-blue-300" : "hover:text-gray-300"}
            >
              Dashboard
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink 
              to="/data-visualization" 
              className={({ isActive }) => isActive ? "text-blue-300" : "hover:text-gray-300"}
            >
              Data Visualization
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink 
              to="/company-data" 
              className={({ isActive }) => isActive ? "text-blue-300" : "hover:text-gray-300"}
            >
              Comapany Data
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="mb-12 flex-row">
        <NavLink to="/" className="hover:text-gray-300">Logout</NavLink>
      </div>
    </nav>
  );
};

export default SideNav;
