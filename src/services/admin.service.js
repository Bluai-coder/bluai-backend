// services/admin.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

class AdminService {
    // Hash password
    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    // Verify password
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // Generate JWT token
    generateToken(admin) {
        return jwt.sign(
            { 
                id: admin.id, 
                email: admin.email, 
                role: admin.role,
                isSuperAdmin: admin.role === 'super_admin'
            },
            process.env.JWT_SECRET || 'admin-secret-key',
            { expiresIn: '7d' }
        );
    }

    // Login admin (similar structure to tenant login)
    async login(email, password, ipAddress) {
        const Admin = db.Admin;
        
        const admin = await Admin.findOne({ where: { email } });
        
        // 1. Check if admin exists
        if (!admin) {
            throw new Error('Invalid credentials');
        }
        
        // 2. Check account status
        if (!admin.is_active) {
            throw new Error('Account is deactivated. Please contact super admin.');
        }
        
        // 3. Validate password
        const isValid = await this.verifyPassword(password, admin.password_hash);
        
        if (!isValid) {
            // Track failed attempts (optional)
            throw new Error('Invalid credentials');
        }
        
        // 4. Update last login info
        admin.last_login_at = new Date();
        admin.last_login_ip = ipAddress;
        await admin.save();
        
        // 5. Generate tokens
        const accessToken = this.generateToken(admin);
        const refreshToken = uuidv4();
        
        // 6. Create session (optional - for tracking)
        // You can create an admin_sessions table if needed
        // await this.createSession(admin.id, refreshToken, ipAddress, userAgent);
        
        // 7. Create audit log (optional)
        // await this.createAuditLog({
        //     admin_id: admin.id,
        //     action: 'LOGIN',
        //     ip_address: ipAddress,
        //     user_agent: userAgent,
        // });
        
        // 8. Return response (similar to tenant login)
        return {
            accessToken,
            refreshToken,
            expiresIn: '7d',
            admin: {
                id: admin.id,
                email: admin.email,
                fullName: admin.full_name,
                firstName: admin.full_name?.split(' ')[0] || '',
                lastName: admin.full_name?.split(' ').slice(1).join(' ') || '',
                role: admin.role,
                isActive: admin.is_active,
                lastLoginAt: admin.last_login_at,
            },
            tenant: {
                id: 'public',
                subdomain: 'public',
                name: 'Public',
                schemaName: 'public'
            },
            permissions: this.getPermissionsByRole(admin.role),
        };
    }

    // Get permissions based on role
    getPermissionsByRole(role) {
        const permissionsMap = {
            super_admin: [
                { module: 'all', actions: ['*'] }
            ],
            admin: [
                { module: 'admins', actions: ['create', 'read', 'update', 'delete'] },
                { module: 'dashboard', actions: ['read'] },
                { module: 'settings', actions: ['read', 'update'] },
            ],
            support: [
                { module: 'dashboard', actions: ['read'] },
                { module: 'admins', actions: ['read'] },
            ],
        };
        
        return permissionsMap[role] || permissionsMap.admin;
    }

    // Get all admins
    async getAllAdmins() {
        const Admin = db.Admin;
        
        const admins = await Admin.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']],
        });
        
        return admins;
    }

    // Get admin by ID
    async getAdminById(id) {
        const Admin = db.Admin;
        
        const admin = await Admin.findByPk(id, {
            attributes: { exclude: ['password_hash'] },
        });
        
        return admin;
    }

    // Get admin by email
    async getAdminByEmail(email) {
        const Admin = db.Admin;
        
        const admin = await Admin.findOne({
            where: { email },
            attributes: { exclude: ['password_hash'] },
        });
        
        return admin;
    }

    // Create admin
    async createAdmin(data, createdBy = null) {
        const Admin = db.Admin;
        
        // Check if email exists
        const existing = await Admin.findOne({ where: { email: data.email } });
        if (existing) {
            throw new Error('Admin with this email already exists');
        }
        
        const admin = await Admin.create({
            id: uuidv4(),
            email: data.email,
            password_hash: await this.hashPassword(data.password),
            full_name: data.fullName,
            role: data.role || 'admin',
            is_active: data.isActive !== false,
        });
        
        // Return with same structure
        return {
            id: admin.id,
            email: admin.email,
            fullName: admin.full_name,
            role: admin.role,
            isActive: admin.is_active,
            createdAt: admin.created_at,
        };
    }

    // Update admin
    async updateAdmin(id, data) {
        const Admin = db.Admin;
        
        const admin = await Admin.findByPk(id);
        if (!admin) {
            throw new Error('Admin not found');
        }
        
        if (data.fullName) admin.full_name = data.fullName;
        if (data.role) admin.role = data.role;
        if (data.isActive !== undefined) admin.is_active = data.isActive;
        if (data.password) {
            admin.password_hash = await this.hashPassword(data.password);
        }
        
        admin.updated_at = new Date();
        await admin.save();
        
        return {
            id: admin.id,
            email: admin.email,
            fullName: admin.full_name,
            role: admin.role,
            isActive: admin.is_active,
            updatedAt: admin.updated_at,
        };
    }

    // Delete admin
    async deleteAdmin(id) {
        const Admin = db.Admin;
        
        const admin = await Admin.findByPk(id);
        if (!admin) {
            throw new Error('Admin not found');
        }
        
        // Prevent deleting your own account
        // You can add logic here
        
        await admin.destroy();
        
        return true;
    }

    // Update own profile
    async updateProfile(adminId, data) {
        const Admin = db.Admin;
        
        const admin = await Admin.findByPk(adminId);
        if (!admin) {
            throw new Error('Admin not found');
        }
        
        if (data.fullName) admin.full_name = data.fullName;
        if (data.password) {
            admin.password_hash = await this.hashPassword(data.password);
        }
        
        admin.updated_at = new Date();
        await admin.save();
        
        return {
            id: admin.id,
            email: admin.email,
            fullName: admin.full_name,
            role: admin.role,
        };
    }

    // Get dashboard stats
    async getDashboardStats() {
        const Admin = db.Admin;
        
        const totalAdmins = await Admin.count();
        const activeAdmins = await Admin.count({ where: { is_active: true } });
        const superAdmins = await Admin.count({ where: { role: 'super_admin' } });
        const admins = await Admin.count({ where: { role: 'admin' } });

        return {
            totalAdmins,
            activeAdmins,
            superAdmins,
            admins,
            recentLogins: await Admin.findAll({
                where: { last_login_at: { [db.Sequelize.Op.ne]: null } },
                order: [['last_login_at', 'DESC']],
                limit: 5,
                attributes: ['full_name', 'email', 'last_login_at', 'role'],
            }),
        };
    }
}

module.exports = new AdminService();
