import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Tasks from './components/Tasks';
import Articles from './components/Articles';
import Robots from './components/Robots';
import Login from './components/Login';

// Create Dark Mode Context
export const DarkModeContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // ✅ FIX: Update dark mode class on root element
  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
          {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
          
          <div className="bg-gray-100 dark:bg-gray-900 transition-colors duration-200 min-h-screen">
            <Routes>
              <Route 
                path="/login" 
                element={
                  !isAuthenticated ? 
                  <Login onLogin={handleLogin} /> : 
                  <Navigate to="/" />
                } 
              />
              
              <Route 
                path="/" 
                element={
                  isAuthenticated ? 
                  <Dashboard user={user} /> : 
                  <Navigate to="/login" />
                } 
              />
              
              <Route 
                path="/members" 
                element={
                  isAuthenticated ? 
                  <Members user={user} /> : 
                  <Navigate to="/login" />
                } 
              />
              
              <Route 
                path="/tasks" 
                element={
                  isAuthenticated ? 
                  <Tasks user={user} /> : 
                  <Navigate to="/login" />
                } 
              />
              
              <Route 
                path="/articles" 
                element={
                  isAuthenticated ? 
                  <Articles user={user} /> : 
                  <Navigate to="/login" />
                } 
              />
              
              <Route 
                path="/robots" 
                element={
                  isAuthenticated ? 
                  <Robots user={user} /> : 
                  <Navigate to="/login" />
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </DarkModeContext.Provider>
  );
}

export default App;
