const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { uploadProductMedia } = require('../utils/uploadMedia');
const { adminAuth } = require('../middlewares/adminAuth');

router.use(adminAuth); // require auth for product management

router.post('/', uploadProductMedia, productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', uploadProductMedia, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
