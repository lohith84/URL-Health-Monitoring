import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Globe, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

function App() {
  const [urls, setUrls] = useState([]);
  const [newUrls, setNewUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkResults, setCheckResults] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('monitor');

  useEffect(() => {
    fetchUrls();
    fetchStats();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${API_BASE}/urls`);
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addUrls = async () => {
    if (!newUrls.trim()) return;

    const urlList = newUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    try {
      const response = await fetch(`${API_BASE}/urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlList }),
      });

      if (response.ok) {
        setNewUrls('');
        fetchUrls();
        fetchStats();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding URLs:', error);
      alert('Failed to add URLs');
    }
  };

  const deleteUrl = async (url) => {
    try {
      const response = await fetch(`${API_BASE}/urls/${encodeURIComponent(url)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUrls();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  const checkAllUrls = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/check-all`, {
        method: 'POST',
      });
      const results = await response.json();
      setCheckResults(results);
      fetchStats();
    } catch (error) {
      console.error('Error checking URLs:', error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UP':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DOWN':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UP':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DOWN':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUptimeColor = (uptime) => {
    const uptimeNum = parseFloat(uptime);
    if (uptimeNum >= 95) return 'text-green-600';
    if (uptimeNum >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            URL Health Monitor
          </h1>
          <p className="text-gray-600">
            Monitor your websites and APIs with real-time health checks
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-200 p-1 rounded-lg max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'monitor'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monitor
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Statistics
          </button>
        </div>

        {activeTab === 'monitor' && (
          <div className="space-y-8">
            {/* Add URLs Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add URLs to Monitor
              </h2>
              <div className="space-y-4">
                <textarea
                  value={newUrls}
                  onChange={(e) => setNewUrls(e.target.value)}
                  placeholder="Enter URLs (one per line)&#10;https://example.com&#10;https://google.com&#10;https://github.com"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={addUrls}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add URLs
                </button>
              </div>
            </div>

            {/* URL List and Check Results */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Monitored URLs ({urls.length})
                </h2>
                <button
                  onClick={checkAllUrls}
                  disabled={loading || urls.length === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Checking...' : 'Check All'}
                </button>
              </div>

              {urls.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No URLs added yet. Add some URLs to start monitoring!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {urls.map((url, index) => {
                    const result = checkResults.find(r => r.url === url);
                    return (
                      <div
                        key={url}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            {result ? getStatusIcon(result.status) : <AlertCircle className="w-5 h-5 text-gray-400" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {url}
                              </p>
                              {result && (
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(result.status)}`}>
                                    {result.status}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {result.responseTime}ms
                                  </span>
                                  {result.statusCode && (
                                    <span className="text-xs text-gray-500">
                                      HTTP {result.statusCode}
                                    </span>
                                  )}
                                </div>
                              )}
                              {result && result.error && (
                                <p className="text-xs text-red-600 mt-1">
                                  {result.error}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteUrl(url)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Health Statistics
            </h2>

            {Object.keys(stats).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No statistics available yet. Check some URLs to see health metrics!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(stats).map(([url, stat]) => (
                  <div key={url} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900 truncate flex-1 mr-4">
                        {url}
                      </h3>
                      {stat.lastCheck && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(stat.lastCheck.status)}`}>
                          {stat.lastCheck.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getUptimeColor(stat.uptime)}`}>
                          {stat.uptime}%
                        </div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {stat.avgResponseTime}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Response</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {stat.totalChecks}
                        </div>
                        <div className="text-sm text-gray-600">Total Checks</div>
                      </div>
                    </div>

                    {stat.lastCheck && (
                      <div className="mt-4 text-sm text-gray-500">
                        Last checked: {new Date(stat.lastCheck.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500">
            URL Health Monitor - Automatic checks every 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;