const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../middleware/errorMiddleware');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Single file upload
router.post('/single', async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new ApiError(400, 'No files were uploaded.');
    }

    const file = req.files.file;
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await file.mv(filePath);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        path: `/uploads/${fileName}`
      }
    });
  } catch (error) {
    next(error);
  }
});

// Multiple files upload
router.post('/multiple', async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new ApiError(400, 'No files were uploaded.');
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    const uploadResults = [];

    for (const file of files) {
      const fileExt = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      await file.mv(filePath);

      uploadResults.push({
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        path: `/uploads/${fileName}`,
        status: 'success'
      });
    }

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadResults
    });
  } catch (error) {
    next(error);
  }
});

// List uploaded files
router.get('/files', (req, res, next) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        name: file,
        path: `/uploads/${file}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    });

    res.json({
      success: true,
      files: fileDetails
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
