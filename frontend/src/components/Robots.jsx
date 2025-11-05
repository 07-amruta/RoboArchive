import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Robots = ({ user }) => {
  const [robots, setRobots] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRobot, setNewRobot] = useState({
    name: '',
    competition_year: new Date().getFullYear(),
    team_lead_id: '',
    specifications: '',
    performance_notes: '',
    final_rank: ''
  });

  useEffect(() => {
    fetchRobots();
    fetchMembers();
  }, []);

  const fetchRobots = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/robots');
      setRobots(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching robots:', error);
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleCreateRobot = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/robots', newRobot, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewRobot({
        name: '',
        competition_year: new Date().getFullYear(),
        team_lead_id: '',
        specifications: '',
        performance_notes: '',
        final_rank: ''
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
      await axios.delete(`http://localhost:5000/api/robots/${robotId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRobots();
      alert('Robot deleted successfully');
    } catch (error) {
      alert('Error deleting robot: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Robot Archive 🤖</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Robot
        </button>
      </div>

      <div className="space-y-6">
        {robots.map((robot) => (
          <div key={robot.robot_id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-2xl font-bold text-gray-800">{robot.name}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {robot.competition_year}
                  </span>
                  {robot.final_rank && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      Rank #{robot.final_rank}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Team Lead</p>
                    <p className="font-semibold">{robot.team_lead_name || 'Not assigned'}</p>
                  </div>
                  
                  {robot.specifications && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Specifications</p>
                      <p className="text-sm">{robot.specifications}</p>
                    </div>
                  )}
                </div>

                {robot.performance_notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Performance Notes</p>
                    <p className="text-sm text-gray-700">{robot.performance_notes}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
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
        <div className="text-center py-12 text-gray-500">
          No robots in the archive yet. Add your first robot!
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
            <h2 className="text-2xl font-bold mb-4">Add New Robot</h2>
            <form onSubmit={handleCreateRobot} className="space-y-4">
              <input
                type="text"
                placeholder="Robot Name"
                value={newRobot.name}
                onChange={(e) => setNewRobot({...newRobot, name: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Competition Year"
                  value={newRobot.competition_year}
                  onChange={(e) => setNewRobot({...newRobot, competition_year: e.target.value})}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <input
                  type="number"
                  placeholder="Final Rank (optional)"
                  value={newRobot.final_rank}
                  onChange={(e) => setNewRobot({...newRobot, final_rank: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={newRobot.team_lead_id}
                onChange={(e) => setNewRobot({...newRobot, team_lead_id: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Team Lead...</option>
                {members.map(member => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              
              <textarea
                placeholder="Specifications (dimensions, weight, actuators, etc.)"
                value={newRobot.specifications}
                onChange={(e) => setNewRobot({...newRobot, specifications: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              
              <textarea
                placeholder="Performance Notes (strategy, achievements, issues)"
                value={newRobot.performance_notes}
                onChange={(e) => setNewRobot({...newRobot, performance_notes: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Robot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
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
