import { createBrowserRouter, RouterProvider } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import LogIn from "./Login.jsx";
import Layout from "./Layout/Layout.jsx";
import Dashboard from "./UI/Dashboard.jsx";
import DataVisualization from "./UI/DataVisualization.jsx";
import Members from "./UI/Members.jsx";
import Report from "./UI/Report.jsx";
import SensorData from "./UI/SensorData.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LogIn />,
  },
  {
    path: "/",
    element: <Layout />, 
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/sensor-data", element: <SensorData /> },
      { path: "/data-visualization", element: <DataVisualization /> },
      { path: "/members", element: <Members /> },
      { path: "/reports", element: <Report /> },
    ],
  },
],{
  basename: '/water_quality_system'
});

export default function MainApp() {
  return <RouterProvider router={router} />;
}
