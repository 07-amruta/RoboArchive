import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DarkModeContext } from '../App';

const Members = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const { darkMode } = useContext(DarkModeContext);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();
      alert('Member deleted successfully');
    } catch (error) {
      alert('Error deleting member: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredMembers = filterRole === 'all' 
    ? members 
    : members.filter(m => m.role === filterRole);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-800 dark:text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Team Members</h1>
        <div className="flex gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <option value="all">All Roles</option>
            <option value="mechanical">Mechanical</option>
            <option value="electrical">Electrical</option>
            <option value="coding">Coding</option>
            <option value="design">Design</option>
            <option value="strategy">Strategy</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.member_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{member.email}</p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-semibold ${
                member.privilege_level === 'admin' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                member.privilege_level === 'leader' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {member.privilege_level}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Role:</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                  {member.role}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Joined:</span>
                <span className="text-sm text-gray-900 dark:text-gray-300">{member.join_year}</span>
              </div>
              {member.graduation_year && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Graduating:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-300">{member.graduation_year}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Status:</span>
                <span className={`text-sm ${member.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {user?.privilege_level === 'admin' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(member.member_id)}
                  className="flex-1 bg-red-500 dark:bg-red-700 text-white py-2 rounded hover:bg-red-600 dark:hover:bg-red-800 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No members found for the selected role
        </div>
      )}
    </div>
  );
};

export default Members;
