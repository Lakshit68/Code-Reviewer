require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require("./routes/route");
const githubAuthRoutes = require('./routes/githubAuthRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Update with your frontend URL
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 }, // 10MB default
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.send("hello world")
})
app.use('/ai', aiRoutes);
app.use('/api', githubAuthRoutes);

app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;