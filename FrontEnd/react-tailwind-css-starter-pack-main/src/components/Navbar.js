import React, { useState } from 'react';

const Navbar = () => {
  const [ismenuopen, setismenuopen] = useState(false);

  const togglemenu = () => {
    setismenuopen(!ismenuopen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-xl font-bold">
              Interview <span className='text-bl'>Geeks</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={togglemenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:space-x-8 md:items-center">
            <a
              href="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              AI Mock Interview
            </a>
            <a
              href="/interview"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              AI Resume Builder
            </a>
            <a
<<<<<<< HEAD
              href="/login"
=======
              href="/results"
>>>>>>> origin/main
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Login
            </a>
            <a
  href="/signup"
  className="block bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded-md text-base font-medium"
>
  Sign up
</a>

          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {ismenuopen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
<<<<<<< HEAD
              href="/interview"
=======
              href="/"
>>>>>>> origin/main
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
            >
              AI Mock Interview
            </a>
            <a
<<<<<<< HEAD
              href="/resume"
=======
              href="/interview"
>>>>>>> origin/main
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
            >
              AI Resume Builder
            </a>
            <a
<<<<<<< HEAD
              href="/login"
=======
              href="/results"
>>>>>>> origin/main
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
            >
              Login
            </a>
            <a
  href="/signup"
  className="inline-flex items-center bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md text-sm md:text-base font-medium"
>
  Sign up
</a>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;