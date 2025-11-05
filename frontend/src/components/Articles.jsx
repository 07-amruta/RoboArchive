import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Articles = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    type: 'tutorial',
    category: '',
    competition_year: ''
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/articles');
      setArticles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/articles', newArticle, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewArticle({ title: '', content: '', type: 'tutorial', category: '', competition_year: '' });
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
      await axios.delete(`http://localhost:5000/api/articles/${articleId}`, {
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
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || article.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Knowledge Base</h1>
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
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="tutorial">Tutorials</option>
          <option value="strategy">Strategy</option>
          <option value="documentation">Documentation</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.article_id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 rounded text-xs font-semibold ${
                article.type === 'tutorial' ? 'bg-blue-100 text-blue-800' :
                article.type === 'strategy' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {article.type}
              </span>
              {article.competition_year && (
                <span className="text-xs text-gray-500">Year: {article.competition_year}</span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">{article.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{article.content}</p>
            
            <div className="border-t pt-3 mt-3">
              <p className="text-xs text-gray-500">By: {article.author_name || 'Unknown'}</p>
              {article.category && (
                <p className="text-xs text-gray-500">Category: {article.category}</p>
              )}
              <p className="text-xs text-gray-500">Views: {article.view_count || 0}</p>
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
        <div className="text-center py-12 text-gray-500">
          No articles found
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
            <h2 className="text-2xl font-bold mb-4">Create New Article</h2>
            <form onSubmit={handleCreateArticle} className="space-y-4">
              <input
                type="text"
                placeholder="Article Title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <textarea
                placeholder="Content"
                value={newArticle.content}
                onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="8"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newArticle.type}
                  onChange={(e) => setNewArticle({...newArticle, type: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tutorial">Tutorial</option>
                  <option value="strategy">Strategy</option>
                  <option value="documentation">Documentation</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Category (e.g., CAD, Wiring)"
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <input
                type="number"
                placeholder="Competition Year (optional)"
                value={newArticle.competition_year}
                onChange={(e) => setNewArticle({...newArticle, competition_year: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Article
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

export default Articles;
