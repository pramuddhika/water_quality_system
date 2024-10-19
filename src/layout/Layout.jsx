import { Outlet,useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import SideNav from './SideNav';

const Layout = () => {
  const location = useLocation();
  // Determine the title based on the current path
  let title = '';
  if (location.pathname === '/dashboard') {
    title = 'Dashboard';
  } else if (location.pathname === '/data-visualization') {
    title = 'Data Visualization';
  }

  return (
    <div className="flex h-screen">
      <div className="w-[180px]">
        <SideNav />
      </div>
      
      <div className="flex-1">
        <TopBar title={title} />
        <div className="p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
