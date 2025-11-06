import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DarkModeContext } from '../App';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Articles = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { darkMode } = useContext(DarkModeContext);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    type: 'tutorial',
    category: '',
    competition_year: '',
    file: null
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/articles`);
      setArticles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    
    // Only title is required
    if (!newArticle.title.trim()) {
      alert('Article title is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newArticle.title);
      formData.append('content', newArticle.content || '');
      formData.append('type', newArticle.type);
      formData.append('category', newArticle.category || '');
      formData.append('competition_year', newArticle.competition_year || '');
      if (newArticle.file) {
        formData.append('file', newArticle.file);
      }

      await axios.post(`${API_URL}/api/articles`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowAddModal(false);
      setNewArticle({
        title: '',
        content: '',
        type: 'tutorial',
        category: '',
        competition_year: '',
        file: null
      });
      fetchArticles();
      alert('Article created successfully');
    } catch (error) {
      alert('Error creating article: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/articles/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchArticles();
      alert('Article deleted successfully');
    } catch (error) {
      alert('Error deleting article: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || article.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-800 dark:text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Knowledge Base</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Article
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="tutorial">Tutorials</option>
          <option value="strategy">Strategy</option>
          <option value="documentation">Documentation</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.article_id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 rounded text-xs font-semibold ${
                article.type === 'tutorial' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                article.type === 'strategy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
              }`}>
                {article.type}
              </span>
              {article.competition_year && (
                <span className="text-xs text-gray-500 dark:text-gray-400">Year: {article.competition_year}</span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{article.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
              {article.content || 'No description'}
            </p>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">By: {article.author_name || 'Unknown'}</p>
              {article.category && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Category: {article.category}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">Views: {article.view_count || 0}</p>
              {article.file_path && (
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                  <a href={`${API_URL}${article.file_path}`} target="_blank" rel="noopener noreferrer">
                    📎 View Attachment
                  </a>
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm">
                View
              </button>
              {user?.member_id === article.author_id && (
                <button
                  onClick={() => handleDeleteArticle(article.article_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No articles found
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Article</h2>
            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Article Title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Content <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  placeholder="Article content..."
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="6"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={newArticle.type}
                    onChange={(e) => setNewArticle({...newArticle, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="strategy">Strategy</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CAD, Wiring"
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Competition Year <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2024"
                  value={newArticle.competition_year}
                  onChange={(e) => setNewArticle({...newArticle, competition_year: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Upload File <span className="text-gray-500">(Optional - PDF, Images, Docs)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  onChange={(e) => setNewArticle({...newArticle, file: e.target.files[0]})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newArticle.file && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ File selected: {newArticle.file.name}</p>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Article
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

export default Articles;
