const User = require('./User');
const Blacklist = require('./Blacklist');
const Review = require('./Review');
const Vote = require('./Vote');

// Define associations
User.hasMany(Blacklist, { foreignKey: 'user_id', as: 'blacklists' });
Blacklist.belongsTo(User, { foreignKey: 'user_id', as: 'reporter' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

Blacklist.hasMany(Review, { foreignKey: 'blacklist_id', as: 'reviews' });
Review.belongsTo(Blacklist, { foreignKey: 'blacklist_id', as: 'blacklist' });

User.hasMany(Vote, { foreignKey: 'user_id', as: 'votes' });
Vote.belongsTo(User, { foreignKey: 'user_id', as: 'voter' });

Blacklist.hasMany(Vote, { foreignKey: 'blacklist_id', as: 'votes' });
Vote.belongsTo(Blacklist, { foreignKey: 'blacklist_id', as: 'blacklist' });

module.exports = {
    User,
    Blacklist,
    Review,
    Vote
};
