import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DarkModeContext } from '../App';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Robots = ({ user }) => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { darkMode } = useContext(DarkModeContext);
  const [newRobot, setNewRobot] = useState({
    name: '',
    model: '',
    status: 'active',
    specifications: '',
    file: null
  });

  useEffect(() => {
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/robots`);
      setRobots(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching robots:', error);
      setLoading(false);
    }
  };

  const handleCreateRobot = async (e) => {
    e.preventDefault();
    
    // Only name is required
    if (!newRobot.name.trim()) {
      alert('Robot name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newRobot.name);
      formData.append('model', newRobot.model || '');
      formData.append('status', newRobot.status);
      formData.append('specifications', newRobot.specifications || '');
      if (newRobot.file) {
        formData.append('file', newRobot.file);
      }

      await axios.post(`${API_URL}/api/robots`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowAddModal(false);
      setNewRobot({
        name: '',
        model: '',
        status: 'active',
        specifications: '',
        file: null
      });
      fetchRobots();
      alert('Robot created successfully');
    } catch (error) {
      alert('Error creating robot: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteRobot = async (robotId) => {
    if (!window.confirm('Are you sure you want to delete this robot?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/robots/${robotId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRobots();
      alert('Robot deleted successfully');
    } catch (error) {
      alert('Error deleting robot: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-800 dark:text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Robot Archive 🤖</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Robot
        </button>
      </div>

      <div className="space-y-6">
        {robots.map((robot) => (
          <div key={robot.robot_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{robot.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    robot.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    robot.status === 'inactive' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' :
                    'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {robot.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {robot.model && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Model</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{robot.model}</p>
                    </div>
                  )}
                  
                  {robot.specifications && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Specifications</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{robot.specifications}</p>
                    </div>
                  )}
                </div>

                {robot.file_path && (
                  <div className="mb-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <a href={`${API_URL}${robot.file_path}`} target="_blank" rel="noopener noreferrer">
                        📎 View Media
                      </a>
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(robot.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="ml-4">
                <button
                  onClick={() => handleDeleteRobot(robot.robot_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {robots.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No robots in the archive yet. Add your first robot!
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add New Robot</h2>
            <form onSubmit={handleCreateRobot} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Robot Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Robot Name"
                  value={newRobot.name}
                  onChange={(e) => setNewRobot({...newRobot, name: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Model <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., V1.0, V2.0"
                    value={newRobot.model}
                    onChange={(e) => setNewRobot({...newRobot, model: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={newRobot.status}
                    onChange={(e) => setNewRobot({...newRobot, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Specifications <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  placeholder="Dimensions, weight, actuators, components, etc."
                  value={newRobot.specifications}
                  onChange={(e) => setNewRobot({...newRobot, specifications: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Upload Media <span className="text-gray-500">(Optional - Images, Videos, PDFs)</span>
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.mp4,.avi,.mov"
                  onChange={(e) => setNewRobot({...newRobot, file: e.target.files[0]})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newRobot.file && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ File selected: {newRobot.file.name}</p>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Robot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Robots;
