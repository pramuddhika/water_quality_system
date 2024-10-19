

const SideNav = () => {
  return (
    <div className="fixed top-0 left-0 w-[180px] shadow-lg shadow-main bg-side-nav-bg h-screen">
      <div className="font-inter text-main p-4 mb-8">
        <p className="flex font-bold text-l justify-center">Water Quality</p>
        <p className="flex justify-end font-semibold mr-2">System</p>
      </div>
      
    </div>
  );
};

export default SideNav;