import { Outlet,useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import SideNav from './SideNav';
import { useState } from 'react';

const Layout = () => {
  const location = useLocation();
  // Determine the title based on the current path
  let title = 'Dashboard';
  if (location.pathname === '/dashboard') {
    title = 'Dashboard';
  } else if (location.pathname === '/data-visualization') {
    title = 'Data Visualization';
  } else if (location.pathname === '/members') {
    title = 'Member Management';
  } else if (location.pathname === '/reports') {
    title = 'Reports';
  } else if (location.pathname === '/sensor-data') {
    title = 'Sensor Data';
  } else if (location.pathname === '/settings') {
    title = 'Settings';
  } else if (location.pathname === '/client-data') { 
    title = 'Client Data';
  }

  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <div className="flex h-screen">
    {/* Sidebar */}
    <div
      className={`absolute md:relative z-20 w-[180px] bg-white transition-transform transform ${
        isSideNavOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <SideNav />
    </div>

    {/* Main Content */}
    <div className="flex-1">
      {/* TopBar */}
      <TopBar
        title={title}
        className="h-[60px]"
        toggleSideNav={toggleSideNav}
      />

      {/* Main Area */}
      <div className="p-2">
        <Outlet />
      </div>
    </div>

    {/* Overlay for mobile when side nav is open */}
    {isSideNavOpen && (
      <div
        className="fixed inset-0 bg-black z-10 md:hidden"
        onClick={toggleSideNav}
      ></div>
    )}
  </div>
  );
};

export default Layout;
