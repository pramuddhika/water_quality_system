import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Login from "./LogIn"
import AppLayout from './layout/AppLayout';

import Dashbord from './UI/Dashboard';

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/app/*', element: <AppLayout />, children: [
    {path: '/', element: <Dashbord />}
  ]}
])

function App() {
  

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
