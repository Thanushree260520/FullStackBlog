const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
  updatePost,
  deletePost
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

// Get all posts
router.get("/", getPosts);

// Create post
router.post("/", authMiddleware, createPost);

// Update post
router.put("/:id", authMiddleware, updatePost);

// Delete post
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;