const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// ==============================
// Blog Image Upload
// ==============================
const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bluai-blogs',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  },
});

const uploadBlogImage = multer({
  storage: blogStorage,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('image');

// ==============================
// Gallery Media Upload
// ==============================
const GALLERY_UPLOAD_DIR = path.join(__dirname, '../uploads/gallery');
if (!fs.existsSync(GALLERY_UPLOAD_DIR)) fs.mkdirSync(GALLERY_UPLOAD_DIR, { recursive: true });

const galleryDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, GALLERY_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, 'gallery_' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

const galleryCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'bluai-gallery',
      resource_type: 'auto',
    };
  },
});

const galleryStorage = {
  _handleFile: function (req, file, cb) {
    const isDoc = /doc|docx|xls|xlsx|ppt|pptx/i.test(file.originalname);
    if (isDoc) {
      galleryDiskStorage._handleFile(req, file, cb);
    } else {
      galleryCloudinaryStorage._handleFile(req, file, cb);
    }
  },
  _removeFile: function (req, file, cb) {
    const isDoc = /doc|docx|xls|xlsx|ppt|pptx/i.test(file.originalname);
    if (isDoc) {
      galleryDiskStorage._removeFile(req, file, cb);
    } else {
      galleryCloudinaryStorage._removeFile(req, file, cb);
    }
  }
};

const galleryFileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm|pdf|doc|docx|xls|xlsx|ppt|pptx|glb|gltf|zip/;
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (allowedExts.test(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file type. Allowed: images (jpeg/jpg/png/gif/webp), videos (mp4/mov/avi/webm), documents (pdf/doc/docx/xls/xlsx/ppt/pptx), products (glb/gltf/zip)'
      )
    );
  }
};

const uploadGalleryMedia = multer({
  storage: galleryStorage,
  fileFilter: galleryFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: 'src', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// ==============================
// Product Media Upload
// ==============================
const PRODUCT_UPLOAD_DIR = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(PRODUCT_UPLOAD_DIR)) fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

const productDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, 'product_' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

const productCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'bluai-products',
      resource_type: 'auto',
    };
  },
});

const productStorage = {
  _handleFile: function (req, file, cb) {
    const isModel = /glb|gltf|zip/i.test(file.originalname);
    if (isModel) {
      productDiskStorage._handleFile(req, file, cb);
    } else {
      productCloudinaryStorage._handleFile(req, file, cb);
    }
  },
  _removeFile: function (req, file, cb) {
    const isModel = /glb|gltf|zip/i.test(file.originalname);
    if (isModel) {
      productDiskStorage._removeFile(req, file, cb);
    } else {
      productCloudinaryStorage._removeFile(req, file, cb);
    }
  }
};

const productFileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|gif|webp|glb|gltf|zip|pdf/;
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (allowedExts.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Allowed for products: glb, gltf, zip, pdf, jpeg, jpg, png, webp, gif'));
  }
};

const uploadProductMedia = multer({
  storage: productStorage,
  fileFilter: productFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).fields([
  { name: 'glb_file', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

module.exports = { uploadBlogImage, uploadGalleryMedia, uploadProductMedia };



