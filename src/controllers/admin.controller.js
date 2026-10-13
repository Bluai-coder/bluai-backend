// controllers/admin.controller.js
const adminService = require('../services/admin.service');

class AdminController {
    // Admin login (similar structure to tenant login response)
    async login(req, res) {

        try {
            const { email, password } = req.body;
            const ipAddress = req.ip || req.connection?.remoteAddress;
            const userAgent = req.headers['user-agent'];

            const result = await adminService.login(email, password, ipAddress);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Login successful',
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }

    // Get all admins
    async getAllAdmins(req, res) {
        try {
            const admins = await adminService.getAllAdmins();

            res.status(200).json({
                success: true,
                data: admins,
                message: 'Admins fetched successfully',
            });
        } catch (error) {
            console.error('Get admins error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get admins',
            });
        }
    }

    // Get admin by ID
    async getAdminById(req, res) {
        try {
            const { id } = req.params;

            const admin = await adminService.getAdminById(id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found',
                });
            }

            res.status(200).json({
                success: true,
                data: admin,
                message: 'Admin fetched successfully',
            });
        } catch (error) {
            console.error('Get admin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get admin',
            });
        }
    }

    // Get admin by email
    async getAdminByEmail(req, res) {
        try {
            const { email } = req.params;

            const admin = await adminService.getAdminByEmail(email);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found',
                });
            }

            res.status(200).json({
                success: true,
                data: admin,
                message: 'Admin fetched successfully',
            });
        } catch (error) {
            console.error('Get admin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get admin',
            });
        }
    }

    // Create admin
    async createAdmin(req, res) {
        try {
            const data = req.body;
            const createdBy = req.admin?.id;

            const admin = await adminService.createAdmin(data, createdBy);

            res.status(201).json({
                success: true,
                data: admin,
                message: 'Admin created successfully',
            });
        } catch (error) {
            console.error('Create admin error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create admin',
            });
        }
    }

    // Update admin
    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            const updated = await adminService.updateAdmin(id, data);

            res.status(200).json({
                success: true,
                data: updated,
                message: 'Admin updated successfully',
            });
        } catch (error) {
            console.error('Update admin error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update admin',
            });
        }
    }

    // Delete admin
    async deleteAdmin(req, res) {
        try {
            const { id } = req.params;

            await adminService.deleteAdmin(id);

            res.status(200).json({
                success: true,
                message: 'Admin deleted successfully',
            });
        } catch (error) {
            console.error('Delete admin error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete admin',
            });
        }
    }

    // Get current admin profile
    async getProfile(req, res) {
        try {
            const adminId = req.admin.id;

            const admin = await adminService.getAdminById(adminId);

            res.status(200).json({
                success: true,
                data: admin,
                message: 'Profile fetched successfully',
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile',
            });
        }
    }

    // Update profile
    async updateProfile(req, res) {
        try {
            const adminId = req.admin.id;
            const data = req.body;

            const updated = await adminService.updateProfile(adminId, data);

            res.status(200).json({
                success: true,
                data: updated,
                message: 'Profile updated successfully',
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update profile',
            });
        }
    }

    // Get dashboard stats
    async getDashboardStats(req, res) {
        try {
            const stats = await adminService.getDashboardStats();

            res.status(200).json({
                success: true,
                data: stats,
                message: 'Dashboard stats fetched successfully',
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard stats',
            });
        }
    }
}

module.exports = new AdminController();