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
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-gray-500">Login to your account</p>
          </div>

          <form>
            <div className="mb-4">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="border border-gray-200 rounded-lg p-2 w-full mt-1"
                placeholder="Enter your email"
                aria-label="Email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="border border-gray-200 rounded-lg p-2 w-full mt-1"
                placeholder="Enter your password"
                aria-label="Password"
              />
            </div>

            <div>
              <button
                className="bg-blue-500 text-white w-full py-2 rounded-lg"
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
