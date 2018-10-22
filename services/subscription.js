const db = require('../_helpers/db');
const Subscription = db.Subscription;

module.exports = {
  add,
  _delete
};

async function add(newSub) {
    const sub = new Subscription({ subscription: newSub });
    // save subscription
    await sub.save();
}

async function _delete(id) {
    await Subscription.findByIdAndRemove(id);
}