const fs = require('fs');
const path = require('path');
const { Gallery } = require('../models');

// ==============================
// Helper: delete file from disk
// ==============================
const deleteFile = (relativePath) => {
  try {
    if (!relativePath) return;
    const absPath = path.join(__dirname, '..', relativePath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
    }
  } catch (err) {
    console.error('[Gallery] Failed to delete file:', err.message);
  }
};

// ==============================
// POST /api/v1/gallery
// ==============================
const createGalleryItem = async (req, res) => {
  try {
    const { title, type, thumbnail } = req.body;
    console.log('[Gallery Create] Received type:', type, 'title:', title);

    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'title and type are required' });
    }

    const validTypes = ['images', 'videos', 'documents'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `type must be one of: ${validTypes.join(', ')}`,
      });
    }

    // src: if a file was uploaded use its path (Cloudinary URL), otherwise fall back to body (e.g. video URL)
    const srcFile = req.files && req.files['src'] ? req.files['src'][0] : null;
    const thumbFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
    
    // If it's a Cloudinary URL it starts with http. If it's a local file, we construct the relative path.
    const formatPath = (file) => file.path.startsWith('http') ? file.path : `uploads/gallery/${file.filename}`;

    const src = srcFile ? formatPath(srcFile) : (req.body.src || null);
    const thumbnailFinal = thumbFile ? formatPath(thumbFile) : (thumbnail || null);

    const item = await Gallery.create({
      title,
      type,
      src,
      thumbnail: thumbnailFinal,
    });

    return res.status(201).json({ success: true, message: 'Gallery item created successfully', data: item });
  } catch (error) {
    console.error('[createGalleryItem]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// GET /api/v1/gallery  (supports ?type=images|videos|documents)
// ==============================
const getAllGalleryItems = async (req, res) => {
  try {
    const where = {};
    const { type } = req.query;

    if (type) {
      const validTypes = ['images', 'videos', 'documents'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `type filter must be one of: ${validTypes.join(', ')}`,
        });
      }
      where.type = type;
    }

    const items = await Gallery.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('[getAllGalleryItems]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// GET /api/v1/gallery/:id
// ==============================
const getGalleryItemById = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('[getGalleryItemById]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// PUT /api/v1/gallery/:id
// ==============================
const updateGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    const { title, type, thumbnail } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    updateData.updated_at = new Date();

    if (type !== undefined) {
      const validTypes = ['images', 'videos', 'documents'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `type must be one of: ${validTypes.join(', ')}`,
        });
      }
      updateData.type = type;
    }

    // If a new file was uploaded, replace the old one
    const srcFile = req.files && req.files['src'] ? req.files['src'][0] : null;
    const thumbFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    const formatPath = (file) => file.path.startsWith('http') ? file.path : `uploads/gallery/${file.filename}`;

    if (srcFile) {
      if (item.src && !item.src.startsWith('http')) deleteFile(item.src);
      updateData.src = formatPath(srcFile);
    } else if (req.body.src !== undefined) {
      if (item.src && req.body.src !== item.src && !item.src.startsWith('http')) deleteFile(item.src);
      updateData.src = req.body.src;
    }

    if (thumbFile) {
      if (item.thumbnail && !item.thumbnail.startsWith('http')) deleteFile(item.thumbnail);
      updateData.thumbnail = formatPath(thumbFile);
    } else if (req.body.thumbnail !== undefined) {
      if (item.thumbnail && req.body.thumbnail !== item.thumbnail && !item.thumbnail.startsWith('http')) deleteFile(item.thumbnail);
      updateData.thumbnail = req.body.thumbnail;
    }

    await item.update(updateData);

    return res.status(200).json({ success: true, message: 'Gallery item updated successfully', data: item });
  } catch (error) {
    console.error('[updateGalleryItem]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// DELETE /api/v1/gallery/:id
// ==============================
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    // Delete file from disk only if it's a local path
    if (item.src && !item.src.startsWith('http')) {
      deleteFile(item.src);
    }

    await item.destroy();

    return res.status(200).json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('[deleteGalleryItem]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createGalleryItem,
  getAllGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
};
