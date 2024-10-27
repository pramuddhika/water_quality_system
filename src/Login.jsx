import image1 from "./assets/image1.png";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const LogIn = () => {
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    toast.success('Login successful');
    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  };
  return (
    <>
      <div className="font-[sans-serif] h-screen grid lg:grid-cols-2 md:grid-cols-2 items-center gap-4">
        <div className="order-2 md:order-1 h-screen hidden md:block">
          <img
            src={image1}
            className="w-full h-full object-cover object-right"
            alt="login"
          />
        </div>

        <div className="order-1 md:order-2 p-8">
          <div className="text-center font-bold mb-4">
            <h1 className="text-3xl text-blue-500">Water Quality</h1>
            <h3 className="text-end mr-10 lg:mr-64 md:mr-12 text-blue-400">System</h3>
          </div>
          <div className="mb-6 lg:ml-40">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-gray-500">Login to your account</p>
          </div>

          <form className="lg:mr-40 lg:ml-40">
            <div className="mb-4">
              <label htmlFor="userName" className="text-sm">
                User Name
              </label>
              <input
                type="text"
                id="userName"
                className="border border-gray-200 rounded-lg p-2 w-full mt-1 focus:outline-none"
                placeholder="Enter your user name"
                aria-label="User Name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="border border-gray-200 rounded-lg p-2 w-full mt-1 focus:outline-none"
                placeholder="Enter your password"
                aria-label="Password"
              />
            </div>

            <div>
              <button
                className="bg-blue-500 text-white w-full py-2 rounded-lg hover:bg-blue-900"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default LogIn;
