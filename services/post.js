const db = require('../_helpers/db');
const Post = db.Post;

module.exports = {
  add,
  _delete,
  findById,
  getAll
};

async function getAll(){
  return await Post.find();
}

async function add(newPost) {
    // Check if exist
    if(await Post.findOne(newPost)){
      return true
    }
    
    const post = new Post(newPost);
    // save Post
    await post.save();
}

async function findById(postId) {
    return await Post.findById(postId);
}

async function _delete(id) {
    await Post.findByIdAndRemove(id);
}