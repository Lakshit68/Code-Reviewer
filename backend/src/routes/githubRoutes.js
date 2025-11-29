// backend/src/controllers/githubController.js
const axios = require('axios');
const qs = require('querystring');

// Get access token from GitHub
exports.getAccessToken = async (code) => {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to get access token from GitHub');
  }
};

// Get authenticated user info
exports.getAuthenticatedUser = async (accessToken) => {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw new Error('Failed to get user info from GitHub');
  }
};

// Get user repositories
exports.getUserRepositories = async (accessToken) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        sort: 'updated',
        per_page: 100, // Maximum allowed by GitHub API
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting repositories:', error);
    throw new Error('Failed to get repositories from GitHub');
  }
};

// Get repository contents
exports.getRepositoryContent = async (accessToken, owner, repo, path = '') => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting repository content:', error);
    throw new Error('Failed to get repository content from GitHub');
  }
};

// Get file content
exports.getFileContent = async (accessToken, owner, repo, path) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3.raw',
        },
      }
    );
    return {
      content: response.data,
      encoding: 'utf-8',
    };
  } catch (error) {
    console.error('Error getting file content:', error);
    throw new Error('Failed to get file content from GitHub');
  }
};