const express = require('express');
const router = express.Router();

const { adminAuth } = require('../middlewares/adminAuth');
const { uploadGalleryMedia } = require('../utils/uploadMedia');
const {
  createGalleryItem,
  getAllGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../controllers/gallery.controller');

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
router.get('/', getAllGalleryItems);       // supports ?type=images|videos|documents
router.get('/:id', getGalleryItemById);

// Admin-protected routes
router.post('/', adminAuth, handleUpload(uploadGalleryMedia), createGalleryItem);
router.put('/:id', adminAuth, handleUpload(uploadGalleryMedia), updateGalleryItem);
router.delete('/:id', adminAuth, deleteGalleryItem);

module.exports = router;
