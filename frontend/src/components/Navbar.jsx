import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            🤖 RoboArchive
          </Link>
          
          <div className="flex space-x-6">
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
            <span className="text-sm">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={onLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
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
