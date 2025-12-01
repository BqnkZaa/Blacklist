const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Blacklist, User, Review, Vote } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || './uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blacklist-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
        }
    }
});

// Create blacklist item (requires authentication)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, type, description, address, latitude, longitude, dissatisfaction_rating, first_name, last_name, id_card_number } = req.body;

        // Validation
        if (!name || !type || !description || !dissatisfaction_rating) {
            return res.status(400).json({ error: 'Required fields: name, type, description, dissatisfaction_rating' });
        }

        if (!['restaurant', 'hotel'].includes(type)) {
            return res.status(400).json({ error: 'Type must be restaurant or hotel' });
        }

        const rating = parseInt(dissatisfaction_rating);
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const blacklist = await Blacklist.create({
            user_id: req.userId,
            name,
            first_name,
            last_name,
            id_card_number,
            type,
            description,
            address,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            dissatisfaction_rating: rating,
            image_url: req.file ? `/uploads/${req.file.filename}` : null
        });

        res.status(201).json({
            message: 'Blacklist item created successfully',
            blacklist
        });
    } catch (error) {
        console.error('Create blacklist error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all blacklist items with filters and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            search,
            sortBy = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { status: 'active' };

        // Filter by type
        if (type && ['restaurant', 'hotel'].includes(type)) {
            where.type = type;
        }

        // Search by name or address
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } },
                { id_card_number: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: blacklists, count } = await Blacklist.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order]],
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'username', 'avatar_url']
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

// Get single blacklist item
router.get('/:id', async (req, res) => {
    try {
        const blacklist = await Blacklist.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'username', 'avatar_url']
                },
                {
                    model: Review,
                    as: 'reviews',
                    include: [
                        {
                            model: User,
                            as: 'author',
                            attributes: ['id', 'username', 'avatar_url']
                        }
                    ],
                    order: [['created_at', 'DESC']]
                }
            ]
        });

        if (!blacklist) {
            return res.status(404).json({ error: 'Blacklist item not found' });
        }

        res.json({ blacklist });
    } catch (error) {
        console.error('Get blacklist error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update blacklist item (admin or owner)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const blacklist = await Blacklist.findByPk(req.params.id);

        if (!blacklist) {
            return res.status(404).json({ error: 'Blacklist item not found' });
        }

        // Check if user is admin or owner
        if (req.userRole !== 'admin' && blacklist.user_id !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to update this item' });
        }

        const { name, type, description, address, latitude, longitude, dissatisfaction_rating, first_name, last_name, id_card_number } = req.body;

        if (name) blacklist.name = name;
        if (first_name) blacklist.first_name = first_name;
        if (last_name) blacklist.last_name = last_name;
        if (id_card_number) blacklist.id_card_number = id_card_number;
        if (type && ['restaurant', 'hotel'].includes(type)) blacklist.type = type;
        if (description) blacklist.description = description;
        if (address) blacklist.address = address;
        if (latitude) blacklist.latitude = parseFloat(latitude);
        if (longitude) blacklist.longitude = parseFloat(longitude);
        if (dissatisfaction_rating) {
            const rating = parseInt(dissatisfaction_rating);
            if (rating >= 1 && rating <= 5) {
                blacklist.dissatisfaction_rating = rating;
            }
        }
        if (req.file) {
            blacklist.image_url = `/uploads/${req.file.filename}`;
        }

        await blacklist.save();

        res.json({
            message: 'Blacklist item updated successfully',
            blacklist
        });
    } catch (error) {
        console.error('Update blacklist error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get statistics for a blacklist item
router.get('/:id/stats', async (req, res) => {
    try {
        const blacklist = await Blacklist.findByPk(req.params.id);

        if (!blacklist) {
            return res.status(404).json({ error: 'Blacklist item not found' });
        }

        const totalReviews = await Review.count({ where: { blacklist_id: req.params.id } });
        const totalVotes = await Vote.count({ where: { blacklist_id: req.params.id } });

        res.json({
            stats: {
                upvotes: blacklist.upvotes,
                downvotes: blacklist.downvotes,
                totalReviews,
                totalVotes,
                dissatisfaction_rating: blacklist.dissatisfaction_rating
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Report false information
router.post('/:id/report', authMiddleware, async (req, res) => {
    try {
        const blacklist = await Blacklist.findByPk(req.params.id);

        if (!blacklist) {
            return res.status(404).json({ error: 'Blacklist item not found' });
        }

        blacklist.status = 'reported';
        await blacklist.save();

        res.json({ message: 'Item reported for review' });
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
