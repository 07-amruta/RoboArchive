import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DarkModeContext } from '../App';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 dark:bg-gray-900 text-white shadow-lg transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            🤖 RoboArchive
          </Link>
          
          <div className="flex space-x-6 items-center">
            <Link
              to="/"
              className={`hover:text-blue-200 transition ${isActive('/') ? 'border-b-2 border-white' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/members"
              className={`hover:text-blue-200 transition ${isActive('/members') ? 'border-b-2 border-white' : ''}`}
            >
              Members
            </Link>
            <Link
              to="/tasks"
              className={`hover:text-blue-200 transition ${isActive('/tasks') ? 'border-b-2 border-white' : ''}`}
            >
              Tasks
            </Link>
            <Link
              to="/articles"
              className={`hover:text-blue-200 transition ${isActive('/articles') ? 'border-b-2 border-white' : ''}`}
            >
              Knowledge Base
            </Link>
            <Link
              to="/robots"
              className={`hover:text-blue-200 transition ${isActive('/robots') ? 'border-b-2 border-white' : ''}`}
            >
              Robots
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-yellow-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 text-lg font-bold"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <span className="text-sm">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={onLogout}
              className="bg-red-500 dark:bg-red-700 px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
