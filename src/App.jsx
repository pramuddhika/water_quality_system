import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LogIn from "./LogIn";
import Layout from "./Layout/Layout";
import Dashboard from "./UI/Dashboard";
import DataVisualization from "./UI/DataVisualization";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LogIn />,
  },
  {
    path: "/",
    element: <Layout />, 
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "data-visualization", element: <DataVisualization /> },
    ],
  },
]);

export default function MainApp() {
  return <RouterProvider router={router} />;
}
