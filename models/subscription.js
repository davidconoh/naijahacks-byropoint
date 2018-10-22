const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    subscription: {type: Object, required: true}
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Subscription', schema);