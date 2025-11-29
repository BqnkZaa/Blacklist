const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vote = sequelize.define('Vote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    blacklist_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'blacklists',
            key: 'id'
        }
    },
    vote_type: {
        type: DataTypes.ENUM('up', 'down'),
        allowNull: false
    }
}, {
    tableName: 'votes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Ensure one vote per user per blacklist
Vote.addHook('beforeCreate', async (vote) => {
    const existing = await Vote.findOne({
        where: {
            user_id: vote.user_id,
            blacklist_id: vote.blacklist_id
        }
    });

    if (existing) {
        throw new Error('User has already voted on this item');
    }
});

module.exports = Vote;
