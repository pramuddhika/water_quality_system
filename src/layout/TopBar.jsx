// eslint-disable-next-line react/prop-types
const TopBar = ({  title, className, toggleSideNav }) => {
  return (
    <div className={`flex items-center px-4 bg-gray-100 ${className}`}>
    {/* Menu button (only visible on mobile) */}
    <button
      onClick={toggleSideNav}
      className="block md:hidden mr-4 text-gray-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16m-7 6h7"
        />
      </svg>
    </button>

    <h1 className="text-xl font-semibold">{title}</h1>
  </div>
  );
};

export default TopBar;