import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LogIn from "./LogIn.jsx";
import Layout from "./Layout/Layout.jsx";
import Dashboard from "./UI/Dashboard.jsx";
import DataVisualization from "./UI/DataVisualization.jsx";

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
      { path: "/data-visualization", element: <DataVisualization /> },
    ],
  },
],{
  basename: '/water_quality_system'
});

export default function MainApp() {
  return <RouterProvider router={router} />;
}
