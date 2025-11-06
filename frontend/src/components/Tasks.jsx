import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DarkModeContext } from '../App';

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { darkMode } = useContext(DarkModeContext);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    deadline: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tasks', newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewTask({ title: '', description: '', assigned_to: '', deadline: '', priority: 'medium' });
      fetchTasks();
      alert('Task created successfully');
    } catch (error) {
      alert('Error creating task: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchTasks();
    } catch (error) {
      alert('Error updating task: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      alert('Task deleted successfully');
    } catch (error) {
      alert('Error deleting task: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-800 dark:text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tasks</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
        >
          + Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg transition-colors duration-200">
          <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-300">📋 Pending</h2>
          {tasks.filter(t => t.status === 'pending').map(task => (
            <TaskCard 
              key={task.task_id} 
              task={task} 
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              user={user}
            />
          ))}
        </div>

        <div className="bg-yellow-50 dark:bg-gray-800 p-4 rounded-lg transition-colors duration-200">
          <h2 className="text-xl font-bold mb-4 text-yellow-700 dark:text-yellow-300">🚧 In Progress</h2>
          {tasks.filter(t => t.status === 'in_progress').map(task => (
            <TaskCard 
              key={task.task_id} 
              task={task} 
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              user={user}
            />
          ))}
        </div>

        <div className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg transition-colors duration-200">
          <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">✅ Completed</h2>
          {tasks.filter(t => t.status === 'completed').map(task => (
            <TaskCard 
              key={task.task_id} 
              task={task} 
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              user={user}
            />
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-96 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
              
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                rows="3"
              />
              
              <select
                value={newTask.assigned_to}
                onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="">Assign to...</option>
                {members.map(member => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              
              <input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              />
              
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                >
                  Create
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

const TaskCard = ({ task, onStatusChange, onDelete, user }) => (
  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-3 hover:shadow-lg transition-colors duration-200">
    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{task.title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{task.description}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">Assigned: {task.assigned_to_name || 'Unassigned'}</p>
    {task.deadline && (
      <p className="text-sm text-gray-500 dark:text-gray-400">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
    )}
    <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
      task.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
      task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
      'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    }`}>
      {task.priority}
    </span>
    
    <div className="mt-3 flex gap-2">
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.task_id, e.target.value)}
        className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button
        onClick={() => onDelete(task.task_id)}
        className="bg-red-500 dark:bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-600 dark:hover:bg-red-800 transition"
      >
        Delete
      </button>
    </div>
  </div>
);

export default Tasks;
