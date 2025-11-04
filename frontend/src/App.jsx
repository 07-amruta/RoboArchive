import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';      // ← ADD THIS LINE
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Tasks from './components/Tasks';
import Articles from './components/Articles';
import Robots from './components/Robots';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

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
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        
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
    </Router>
  );
}

export default App;
