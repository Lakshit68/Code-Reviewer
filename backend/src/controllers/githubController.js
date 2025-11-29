const axios = require('axios');
const { Octokit } = require('octokit');
const { ApiError } = require('../middleware/errorMiddleware');

// Initialize Octokit
let octokit;

// Get GitHub access token using the authorization code
const getAccessToken = async (code) => {
  try {
    const params = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    };

    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (response.data.error) {
      throw new ApiError(400, 'Failed to get access token');
    }

    return response.data.access_token;
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    throw new ApiError(500, 'Failed to authenticate with GitHub');
  }
};

// Get authenticated GitHub user
const getAuthenticatedUser = async (accessToken) => {
  try {
    octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.rest.users.getAuthenticated();
    return data;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    throw new ApiError(500, 'Failed to fetch user data from GitHub');
  }
};

// Get user repositories
const getUserRepositories = async (accessToken) => {
  try {
    if (!octokit) {
      octokit = new Octokit({ auth: accessToken });
    }
    
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw new ApiError(500, 'Failed to fetch repositories');
  }
};

// Get repository content
const getRepositoryContent = async (accessToken, owner, repo, path = '') => {
  try {
    if (!octokit) {
      octokit = new Octokit({ auth: accessToken });
    }
    
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching repository content:', error);
    throw new ApiError(500, 'Failed to fetch repository content');
  }
};

// Get file content
const getFileContent = async (accessToken, owner, repo, path) => {
  try {
    if (!octokit) {
      octokit = new Octokit({ auth: accessToken });
    }
    
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return {
      ...data,
      content,
    };
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw new ApiError(500, 'Failed to fetch file content');
  }
};

module.exports = {
  getAccessToken,
  getAuthenticatedUser,
  getUserRepositories,
  getRepositoryContent,
  getFileContent,
};
