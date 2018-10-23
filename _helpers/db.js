const config = require('../config.json');
const mongoose = require('mongoose');
mongoose.connect(config.connectionString,{ useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = {
    Subscription: require('../models/subscription'),
    Post: require('../models/post'),
};