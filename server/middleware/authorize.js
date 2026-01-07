/**
 * Middleware to authorize specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.student) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        // Superusers can access everything
        if (req.student.role === 'superuser') {
            return next();
        }

        if (roles.length > 0 && !roles.includes(req.student.role)) {
            return res.status(403).json({
                message: `Forbidden: Access denied for role '${req.student.role}'. Required one of: [${roles.join(', ')}]`
            });
        }

        next();
    };
};

module.exports = authorize;
