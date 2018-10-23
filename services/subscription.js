const db = require('../_helpers/db');
const Subscription = db.Subscription;

module.exports = {
  add,
  _delete,
  findOne,
  getAll
};

async function add(newSub) {
    const sub = new Subscription({ subscription: newSub });
    // save subscription
    
    await sub.save();
}
async function findOne(sub) {
    return await Subscription.findOne(sub);
}

async function _delete(id) {
    await Subscription.findByIdAndRemove(id);
}

async function getAll(){
    return await Subscription.find();
}