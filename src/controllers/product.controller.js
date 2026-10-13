const db = require('../models');
const { Product } = db;
const AppError = require('../utils/appError');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const parts = url.split('/');
  const filename = parts.pop();
  const folder = parts.pop();
  return folder + '/' + filename.split('.')[0];
};

const deleteMediaFile = async (urlOrPath) => {
  if (!urlOrPath) return;
  if (urlOrPath.includes('cloudinary.com')) {
    const publicId = getPublicIdFromUrl(urlOrPath);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { invalidate: true });
      } catch (error) {
        console.error('Failed to delete from cloudinary:', error);
      }
    }
  } else {
    try {
      const absPath = path.join(__dirname, '../../src', urlOrPath);
      if (fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
      }
    } catch (error) {
      console.error('Failed to delete local file:', error);
    }
  }
};

const formatPath = (file) => {
  return file.path.startsWith('http') ? file.path : 'uploads/products/' + file.filename;
};

exports.createProduct = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let glb_file = null;
    let pdf_file = null;
    let images = [];

    if (req.files) {
      if (req.files.glb_file && req.files.glb_file.length > 0) {
        glb_file = formatPath(req.files.glb_file[0]);
      }
      if (req.files.pdf_file && req.files.pdf_file.length > 0) {
        pdf_file = formatPath(req.files.pdf_file[0]);
      }
      if (req.files.images && req.files.images.length > 0) {
        images = req.files.images.map((file) => formatPath(file));
      }
    }

    const product = await Product.create({
      title,
      glb_file,
      pdf_file,
      images
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({ order: [['created_at', 'DESC']] });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { title, existingImages } = req.body;
    let glb_file = product.glb_file;
    let pdf_file = product.pdf_file;
    let images = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];

    if (req.files) {
      if (req.files.glb_file && req.files.glb_file.length > 0) {
        if (product.glb_file) await deleteMediaFile(product.glb_file);
        glb_file = formatPath(req.files.glb_file[0]);
      }
      if (req.files.pdf_file && req.files.pdf_file.length > 0) {
        if (product.pdf_file) await deleteMediaFile(product.pdf_file);
        pdf_file = formatPath(req.files.pdf_file[0]);
      }
      if (req.files.images && req.files.images.length > 0) {
        const newImages = req.files.images.map((file) => formatPath(file));
        images = [...images, ...newImages];
      }
    }

    if (product.images) {
      for (const oldImg of product.images) {
        if (!images.includes(oldImg)) {
          await deleteMediaFile(oldImg);
        }
      }
    }

    product.title = title || product.title;
    product.glb_file = glb_file;
    product.pdf_file = pdf_file;
    product.images = images;
    product.updated_at = new Date();

    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.glb_file) await deleteMediaFile(product.glb_file);
    if (product.pdf_file) await deleteMediaFile(product.pdf_file);
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await deleteMediaFile(img);
      }
    }

    await product.destroy();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
