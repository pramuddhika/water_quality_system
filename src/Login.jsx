import image1 from "./assets/image1.png";

const LogIn = () => {
  return (
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
            <button className="bg-blue-500 text-white w-full py-2 rounded-lg">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogIn;
