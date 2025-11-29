const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorMiddleware');

const authenticateToken = (req, res, next) => {
  // Get token from header or query parameter
  const token = req.header('Authorization')?.split(' ')[1] || req.query.token;
  
  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(403, 'Invalid or expired token'));
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      username: user.login,
      accessToken: user.accessToken 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};
