import { useState } from "react";
import SideNav from "./SideNav";
import { Link, Outlet } from "react-router-dom";

const AppLayoutAdmin = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const TopBar = () => {
    return (
      <div className="flex flex-initial items-center py-1 justify-between gap-4 cursor-pointer border-2 border-b-green-100">
        <div className="ml-2">
          <p className="text-main text-2xl font-semibold">Page Name</p>
        </div>
        <div className="relative font-[sans-serif] w-max">
          <button
            type="button"
            id="dropdownToggle"
            className="px-4 py-2 flex items-center text-[#333] text-sm outline-none"
            onClick={toggleDropdown}
          >
            <img
              src="https://readymadeui.com/profile_6.webp"
              className="w-7 h-7 mr-3 rounded-full shrink-0"
              alt="Profile"
            />
            Navod Yasara
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 fill-gray-400 inline ml-3"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z"
                clipRule="evenodd"
                data-original="#000000"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <ul
              id="dropdownMenu"
              className="absolute block shadow-lg bg-white z-[1000] min-w-full w-max rounded-lg max-h-96 overflow-auto"
            >
              <li className="py-2.5 px-5 flex items-center hover:bg-green-100 text-[#333] text-sm cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-4 h-4 mr-3"
                  viewBox="0 0 512 512"
                >
                  <path
                    d="M337.711 241.3a16 16 0 0 0-11.461 3.988c-18.739 16.561-43.688 25.682-70.25 25.682s-51.511-9.121-70.25-25.683a16.007 16.007 0 0 0-11.461-3.988c-78.926 4.274-140.752 63.672-140.752 135.224v107.152C33.537 499.293 46.9 512 63.332 512h385.336c16.429 0 29.8-12.707 29.8-28.325V376.523c-.005-71.552-61.831-130.95-140.757-135.223zM446.463 480H65.537V376.523c0-52.739 45.359-96.888 104.351-102.8C193.75 292.63 224.055 302.97 256 302.97s62.25-10.34 86.112-29.245c58.992 5.91 104.351 50.059 104.351 102.8zM256 234.375a117.188 117.188 0 1 0-117.188-117.187A117.32 117.32 0 0 0 256 234.375zM256 32a85.188 85.188 0 1 1-85.188 85.188A85.284 85.284 0 0 1 256 32z"
                    data-original="#000000"
                  ></path>
                </svg>
                View profile
              </li>
              <Link to="/login">
                <li className="py-2.5 px-5 flex items-center hover:bg-green-100 text-[#333] text-sm cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4 mr-3"
                    viewBox="0 0 6.35 6.35"
                  >
                    <path d="M3.172.53a.265.266 0 0 0-.262.268v2.127a.265.266 0 0 0 .53 0V.798A.265.266 0 0 0 3.172.53zm1.544.532a.265.266 0 0 0-.026 0 .265.266 0 0 0-.147.47c.459.391.749.973.749 1.626 0 1.18-.944 2.131-2.116 2.131A2.12 2.12 0 0 1 1.06 3.16c0-.65.286-1.228.74-1.62a.265.266 0 1 0-.344-.404A2.667 2.667 0 0 0 .53 3.158a2.66 2.66 0 0 0 2.647 2.663 2.657 2.657 0 0 0 2.645-2.663c0-.812-.363-1.542-.936-2.03a.265.266 0 0 0-.17-.066z"></path>
                  </svg>
                  Logout
                </li>
              </Link>
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="w-[180px]">
          <SideNav />
        </div>
        <div className="w-calc">
          <TopBar />
          <div className="p-2">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AppLayoutAdmin;