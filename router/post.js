const post = require("express").Router();

const { getPosts, getPost, createPost, updatePost, votePost, deletePost } = require('../controller/post.js');

post.get('/', getPosts);
post.post('/', createPost);
post.get('/:id', getPost);
post.patch('/:id', updatePost);
post.delete('/:id', deletePost);
post.patch('/:id/votePost', votePost);

module.exports = post;
