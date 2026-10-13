const fs = require('fs');
const path = require('path');
const { Blog } = require('../models');

// ==============================
// Helper: resolve absolute path from stored relative path
// ==============================
const resolveFilePath = (relativePath) => {
  if (!relativePath) return null;
  // stored as: uploads/blogs/filename.jpg (relative to src/)
  return path.join(__dirname, '..', relativePath);
};

const deleteFile = (relativePath) => {
  try {
    const absPath = resolveFilePath(relativePath);
    if (absPath && fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
    }
  } catch (err) {
    console.error('[Blog] Failed to delete file:', err.message);
  }
};

// ==============================
// POST /api/v1/blogs
// ==============================
const createBlog = async (req, res) => {
  try {
    const { post_by, text, date_with_time } = req.body;

    if (!post_by) {
      return res.status(400).json({ success: false, message: 'post_by is required' });
    }

    // Cloudinary stores the direct URL in req.file.path
    const image = req.file ? req.file.path : null;

    const blog = await Blog.create({
      post_by,
      text: text || null,
      image,
      date_with_time: date_with_time || new Date(),
    });

    return res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
  } catch (error) {
    console.error('[createBlog]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// GET /api/v1/blogs
// ==============================
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [['date_with_time', 'DESC']],
    });

    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.error('[getAllBlogs]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// GET /api/v1/blogs/:id
// ==============================
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('[getBlogById]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// PUT /api/v1/blogs/:id
// ==============================
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const { post_by, text, date_with_time } = req.body;
    const updateData = {};

    if (post_by !== undefined) updateData.post_by = post_by;
    if (text !== undefined) updateData.text = text;
    if (date_with_time !== undefined) updateData.date_with_time = date_with_time;
    updateData.updated_at = new Date();

    // If a new image was uploaded, replace old one
    if (req.file) {
      // Delete old image file from disk (skip if it's already a Cloudinary URL)
      if (blog.image && !blog.image.startsWith('http')) {
        deleteFile(blog.image);
      }
      updateData.image = req.file.path;
    }

    await blog.update(updateData);

    return res.status(200).json({ success: true, message: 'Blog updated successfully', data: blog });
  } catch (error) {
    console.error('[updateBlog]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// ==============================
// DELETE /api/v1/blogs/:id
// ==============================
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Delete image file from disk only if it's a local file
    if (blog.image && !blog.image.startsWith('http')) {
      deleteFile(blog.image);
    }

    await blog.destroy();

    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('[deleteBlog]', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog };
