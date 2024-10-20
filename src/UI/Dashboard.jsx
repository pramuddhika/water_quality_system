import Image2 from "../assets/under_construction.png";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img
        src={Image2}
        className="h-[350px] object-cover object-center"
        alt="under construction"
      />
      <p className="mt-4 text-center">Under Development</p>
    </div>
  );
};

export default Dashboard;

