// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Public routes
router.post('/login', adminController.login.bind(adminController));



router.get('/profile', adminController.getProfile.bind(adminController));
router.put('/profile', adminController.updateProfile.bind(adminController));

router.get('/admins', adminController.getAllAdmins.bind(adminController));
router.get('/admins/:id', adminController.getAdminById.bind(adminController));
router.post('/admins', adminController.createAdmin.bind(adminController));
router.put('/admins/:id', adminController.updateAdmin.bind(adminController));
router.delete('/admins/:id', adminController.deleteAdmin.bind(adminController));

router.get('/dashboard-stats', adminController.getDashboardStats.bind(adminController));

module.exports = router;