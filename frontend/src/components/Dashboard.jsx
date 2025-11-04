import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeTasks: 0,
    totalArticles: 0,
    totalRobots: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [membersRes, tasksRes, articlesRes, robotsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/members', config),
        axios.get('http://localhost:5000/api/tasks', config),
        axios.get('http://localhost:5000/api/articles'),
        axios.get('http://localhost:5000/api/robots')
      ]);

      setStats({
        totalMembers: membersRes.data.length,
        activeTasks: tasksRes.data.filter(t => t.status !== 'completed').length,
        totalArticles: articlesRes.data.length,
        totalRobots: robotsRes.data.length
      });

      // Get recent activities (last 5 tasks)
      const recent = tasksRes.data.slice(0, 5);
      setRecentActivity(recent);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Welcome back, {user?.name}! 👋
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Members</h3>
          <p className="text-4xl font-bold">{stats.totalMembers}</p>
        </div>
        
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
          <p className="text-4xl font-bold">{stats.activeTasks}</p>
        </div>
        
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Knowledge Articles</h3>
          <p className="text-4xl font-bold">{stats.totalArticles}</p>
        </div>
        
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Robots Archived</h3>
          <p className="text-4xl font-bold">{stats.totalRobots}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Tasks</h2>
        
        {recentActivity.length === 0 ? (
          <p className="text-gray-500">No recent tasks</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((task) => (
              <div key={task.task_id} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-gray-600 text-sm">
                  Assigned to: {task.assigned_to_name || 'Unassigned'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded text-sm ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="text-xl font-bold mb-2">📚 Knowledge Base</h3>
          <p className="text-sm">Access tutorials and documentation</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="text-xl font-bold mb-2">🤖 Robot Archive</h3>
          <p className="text-sm">View past robot designs and specs</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="text-xl font-bold mb-2">✅ My Tasks</h3>
          <p className="text-sm">Check your assigned tasks</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
