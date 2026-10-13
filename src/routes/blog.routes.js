const express = require('express');
const router = express.Router();

const { adminAuth } = require('../middlewares/adminAuth');
const { uploadBlogImage } = require('../utils/uploadMedia');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require('../controllers/blog.controller');

// Multer error handler wrapper
const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Admin-protected routes
router.post('/', adminAuth, handleUpload(uploadBlogImage), createBlog);
router.put('/:id', adminAuth, handleUpload(uploadBlogImage), updateBlog);
router.delete('/:id', adminAuth, deleteBlog);

module.exports = router;
