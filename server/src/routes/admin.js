const express = require('express');
const { User, Blacklist } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Apply auth and admin middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalBlacklists = await Blacklist.count();
        const totalReports = await Blacklist.count({ where: { status: 'reported' } });

        res.json({
            totalUsers,
            totalBlacklists,
            totalReports
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        // Search by username or email
        if (search) {
            where[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: users, count } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: ['id', 'username', 'email', 'role', 'avatar_url', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        res.json({
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be user or admin' });
        }

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admin from changing their own role
        if (user.id === req.userId) {
            return res.status(400).json({ error: 'Cannot change your own role' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: 'User role updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await user.destroy();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all blacklists (including reported/removed)
router.get('/blacklists', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (status && ['active', 'reported', 'removed'].includes(status)) {
            where.status = status;
        }

        if (type && ['restaurant', 'hotel'].includes(type)) {
            where.type = type;
        }

        const { rows: blacklists, count } = await Blacklist.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'username', 'email']
                }
            ]
        });

        res.json({
            blacklists,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get blacklists error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update blacklist status
router.put('/blacklists/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'reported', 'removed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const blacklist = await Blacklist.findByPk(req.params.id);

        if (!blacklist) {
            return res.status(404).json({ error: 'Blacklist item not found' });
        }

        blacklist.status = status;
        await blacklist.save();

        res.json({
            message: 'Blacklist status updated successfully',
            blacklist
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete blacklist (admin only)
router.delete('/blacklists/:id', async (req, res) => {
    try {
        const blacklist = await Blacklist.findByPk(req.params.id);

        if (!blacklist) {
            return res.status(404).json({ error: 'Blacklist item not found' });
        }

        await blacklist.destroy();

        res.json({ message: 'Blacklist item deleted successfully' });
    } catch (error) {
        console.error('Delete blacklist error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
