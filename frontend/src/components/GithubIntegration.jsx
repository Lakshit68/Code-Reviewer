// frontend/src/components/GitHubIntegration.jsx
import { useState, useEffect } from 'react';
import { FiGithub, FiAlertCircle, FiCheck, FiX, FiChevronRight, FiFile, FiFolder } from 'react-icons/fi';
import axios from 'axios';


const API_BASE_URL = 'https://code-reviewer-sovf.onrender.com/api';


const GitHubIntegration = ({ onFileSelect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoContents, setRepoContents] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('githubToken', token);
      setIsConnected(true);
      fetchRepositories(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (localStorage.getItem('githubToken')) {
      setIsConnected(true);
      fetchRepositories(localStorage.getItem('githubToken'));
    }
  }, []);

  const handleGitHubConnect = () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  };

  const handleDisconnect = () => {
    localStorage.removeItem('githubToken');
    setIsConnected(false);
    setRepositories([]);
    setSelectedRepo(null);
    setRepoContents([]);
    setCurrentPath('');
  };

  const fetchRepositories = async (token) => {
    try {
      setLoadingRepos(true);
      const response = await axios.get(`${API_BASE_URL}/repos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRepositories(response.data);
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
      setError('Failed to load repositories. Please try reconnecting.');
      handleDisconnect();
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchRepoContents = async (repo, path = '') => {
    try {
      setLoadingRepos(true);
      setSelectedRepo(repo);
      setCurrentPath(path);
      const response = await axios.get(
        `${API_BASE_URL}/repos/${repo.owner.login}/${repo.name}/contents`,
        { 
          params: { path },
          headers: { Authorization: `Bearer ${localStorage.getItem('githubToken')}` }
        }
      );
      setRepoContents(response.data);
    } catch (err) {
      console.error('Failed to fetch repository contents:', err);
      setError('Failed to load directory contents.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (file.type === 'dir') {
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      await fetchRepoContents(selectedRepo, newPath);
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/repos/${selectedRepo.owner.login}/${selectedRepo.name}/files/${file.path}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('githubToken')}` } }
      );
      
      onFileSelect([{
        name: file.name,
        content: response.data.content,
        type: file.type,
        size: file.size
      }]);
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('Failed to load file content.');
    }
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    fetchRepoContents(selectedRepo, newPath || '');
  };

  if (!isConnected) {
    return (
      <div className="github-connect-root">
        <div className="github-connect-card">
          <div className="github-connect-icon">
            <FiGithub />
          </div>
          <div className="github-connect-text">
            <h3 className="github-connect-title">Connect to GitHub</h3>
            <p className="github-connect-subtitle">
              Connect your GitHub account to browse repositories and import code directly into the reviewer.
            </p>
          </div>
          <div className="github-connect-actions">
            <button
              onClick={handleGitHubConnect}
              className="github-connect-button"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting…' : (
                <>
                  <FiGithub />
                  <span>Connect with GitHub</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="github-connect-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="github-integration">
      <div className="github-header">
        <h3 className="github-title">GitHub Repositories</h3>
        <button
          onClick={handleDisconnect}
          className="github-disconnect-btn"
        >
          Disconnect
        </button>
      </div>

      {selectedRepo ? (
        <div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <button 
              onClick={() => {
                setSelectedRepo(null);
                setCurrentPath('');
              }}
              className="text-blue-600 hover:underline mr-1"
            >
              Repositories
            </button>
            {currentPath && (
              <>
                <span className="mx-1">/</span>
                <button 
                  onClick={navigateUp}
                  className="text-blue-600 hover:underline"
                >
                  {selectedRepo.name}
                </button>
                {currentPath.split('/').map((part, index, parts) => (
                  <span key={index} className="flex items-center">
                    <span className="mx-1">/</span>
                    {index === parts.length - 1 ? (
                      <span className="text-gray-800 font-medium">{part}</span>
                    ) : (
                      <button
                        onClick={() => {
                          const newPath = parts.slice(0, index + 1).join('/');
                          fetchRepoContents(selectedRepo, newPath);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {part}
                      </button>
                    )}
                  </span>
                ))}
              </>
            )}
          </div>

          <div className="border rounded-md overflow-hidden">
            {loadingRepos ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : repoContents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No files found</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {repoContents.map((item) => (
                  <li key={item.path} className="hover:bg-gray-50">
                    <button
                      onClick={() => handleFileSelect(item)}
                      className="w-full text-left px-4 py-3 flex items-center"
                    >
                      {item.type === 'dir' ? (
                        <FiFolder className="text-blue-500 mr-2" />
                      ) : (
                        <FiFile className="text-gray-500 mr-2" />
                      )}
                      <span className="truncate flex-1">{item.name}</span>
                      {item.type === 'dir' && <FiChevronRight className="text-gray-400" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="relative github-search-wrapper">
            <input
              type="text"
              placeholder="Search repositories..."
              className="github-search-input"
            />
          </div>

          {loadingRepos ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="github-repo-panel">
              {repositories.length === 0 ? (
                <div className="github-repo-empty">No repositories found</div>
              ) : (
                <ul className="github-repo-list">
                  {repositories.map((repo) => (
                    <li key={repo.id} className="github-repo-list-item">
                      <button
                        onClick={() => fetchRepoContents(repo)}
                        className="github-repo-item"
                      >
                        <div className="github-repo-icon">
                          <FiFolder />
                        </div>
                        <div className="github-repo-text">
                          <p className="github-repo-name">{repo.name}</p>
                          <p className="github-repo-meta">{repo.private ? 'Private' : 'Public'}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default GitHubIntegration;
