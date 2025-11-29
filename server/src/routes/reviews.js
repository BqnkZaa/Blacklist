const express = require('express');
const { Review } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Add review/comment
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { blacklist_id, comment } = req.body;

        if (!blacklist_id || !comment) {
            return res.status(400).json({ error: 'Blacklist ID and comment are required' });
        }

        const review = await Review.create({
            user_id: req.userId,
            blacklist_id,
            comment
        });

        res.status(201).json({
            message: 'Review added successfully',
            review
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete review (only own reviews)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.user_id !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await review.destroy();

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
