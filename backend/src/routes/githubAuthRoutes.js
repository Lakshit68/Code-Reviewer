// backend/src/routes/githubAuthRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getAccessToken, getAuthenticatedUser, getUserRepositories, getRepositoryContent, getFileContent } = require('../controllers/githubController');

// Redirect to GitHub for authentication
router.get('/auth/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
    scope: 'repo,user',
    allow_signup: 'true'
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.redirect(authUrl);
});

// Handle GitHub OAuth callback
router.get('/auth/github/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Get access token
    const accessToken = await getAccessToken(code);
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    // Get user info
    const user = await getAuthenticatedUser(accessToken);

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        githubToken: accessToken,
        username: user.login 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Redirect to frontend with token
    const frontendUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
    frontendUrl.searchParams.set('token', token);
    res.redirect(frontendUrl.toString());

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
});

// Protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get user's repositories
router.get('/repos', authenticateToken, async (req, res) => {
  try {
    const repos = await getUserRepositories(req.user.githubToken);
    res.json(repos);
  } catch (error) {
    console.error('Error getting repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get repository contents
router.get('/repos/:owner/:repo/contents', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.query.path || '';
    const contents = await getRepositoryContent(req.user.githubToken, owner, repo, path);
    res.json(contents);
  } catch (error) {
    console.error('Error getting repository contents:', error);
    res.status(500).json({ error: 'Failed to fetch repository contents' });
  }
});

// Get file content
router.get('/repos/:owner/:repo/files/*', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0]; // Get the rest of the path
    const fileContent = await getFileContent(req.user.githubToken, owner, repo, path);
    res.json(fileContent);
  } catch (error) {
    console.error('Error getting file content:', error);
    res.status(500).json({ error: 'Failed to fetch file content' });
  }
});

module.exports = router;