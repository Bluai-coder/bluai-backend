// middleware/adminAuth.js
const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Admin token missing. Please log in as admin.',
            });
        }

        // Must match the same secret used in admin.service.js generateToken()
        const secret = process.env.JWT_SECRET || 'admin-secret-key';
        const decoded = jwt.verify(token, secret);

        // Ensure this token belongs to an admin (has a role field), not a regular tenant user
        if (!decoded.role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin account required.',
            });
        }

        req.admin = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            isSuperAdmin: decoded.role === 'super_admin',
        };

        next();
    } catch (error) {
        console.error('[adminAuth] Token verification failed:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired admin token.',
        });
    }
};

// Role-based middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        const adminRole = req.admin?.role;

        if (!adminRole) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        if (roles.includes(adminRole) || adminRole === 'super_admin') {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${roles.join(' or ')}`,
        });
    };
};

module.exports = { adminAuth, requireRole };