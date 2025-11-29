const express = require('express');
const { Vote, Blacklist } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Cast or update vote
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { blacklist_id, vote_type } = req.body;

        if (!blacklist_id || !vote_type) {
            return res.status(400).json({ error: 'Blacklist ID and vote type are required' });
        }

        if (!['up', 'down'].includes(vote_type)) {
            return res.status(400).json({ error: 'Vote type must be up or down' });
        }

        // Check if user already voted
        const existingVote = await Vote.findOne({
            where: {
                user_id: req.userId,
                blacklist_id
            }
        });

        const blacklist = await Blacklist.findByPk(blacklist_id);
        if (!blacklist) {
            return res.status(404).json({ error: 'Blacklist item not found' });
        }

        if (existingVote) {
            // Update existing vote
            const oldVoteType = existingVote.vote_type;

            if (oldVoteType !== vote_type) {
                // Change vote type and update counts
                if (oldVoteType === 'up') {
                    blacklist.upvotes = Math.max(0, blacklist.upvotes - 1);
                    blacklist.downvotes += 1;
                } else {
                    blacklist.downvotes = Math.max(0, blacklist.downvotes - 1);
                    blacklist.upvotes += 1;
                }

                existingVote.vote_type = vote_type;
                await existingVote.save();
                await blacklist.save();

                return res.json({
                    message: 'Vote updated successfully',
                    vote: existingVote
                });
            } else {
                return res.json({
                    message: 'Vote already cast',
                    vote: existingVote
                });
            }
        } else {
            // Create new vote
            const vote = await Vote.create({
                user_id: req.userId,
                blacklist_id,
                vote_type
            });

            // Update vote counts
            if (vote_type === 'up') {
                blacklist.upvotes += 1;
            } else {
                blacklist.downvotes += 1;
            }
            await blacklist.save();

            res.status(201).json({
                message: 'Vote cast successfully',
                vote
            });
        }
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove vote
router.delete('/:blacklist_id', authMiddleware, async (req, res) => {
    try {
        const vote = await Vote.findOne({
            where: {
                user_id: req.userId,
                blacklist_id: req.params.blacklist_id
            }
        });

        if (!vote) {
            return res.status(404).json({ error: 'Vote not found' });
        }

        const blacklist = await Blacklist.findByPk(req.params.blacklist_id);

        // Update vote counts
        if (vote.vote_type === 'up') {
            blacklist.upvotes = Math.max(0, blacklist.upvotes - 1);
        } else {
            blacklist.downvotes = Math.max(0, blacklist.downvotes - 1);
        }
        await blacklist.save();

        await vote.destroy();

        res.json({ message: 'Vote removed successfully' });
    } catch (error) {
        console.error('Remove vote error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's vote for a blacklist item
router.get('/check/:blacklist_id', authMiddleware, async (req, res) => {
    try {
        const vote = await Vote.findOne({
            where: {
                user_id: req.userId,
                blacklist_id: req.params.blacklist_id
            }
        });

        res.json({ vote: vote || null });
    } catch (error) {
        console.error('Check vote error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
