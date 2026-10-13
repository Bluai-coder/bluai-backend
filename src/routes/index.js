const express = require('express');
const router = express.Router();

const adminRoutes = require('./admin.routes');
const blogRoutes = require('./blog.routes');
const galleryRoutes = require('./gallery.routes');
const productRoutes = require('./product.routes');

router.use('/admin', adminRoutes);
router.use('/blogs', blogRoutes);
router.use('/gallery', galleryRoutes);
// router.use('/products', productRoutes);

module.exports = router;