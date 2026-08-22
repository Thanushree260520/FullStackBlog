let posts = [];

// CREATE POST
const createPost = (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      message: "Title and content are required"
    });
  }

  const post = {
    id: Date.now(),
    title,
    content,
    authorId: req.user.id,
    authorName: req.user.email,
    createdAt: new Date().toISOString()
  };

  posts.push(post);

  res.status(201).json({
    message: "Post created successfully",
    post
  });
};


// GET ALL POSTS
const getPosts = (req, res) => {
  res.json(posts);
};


// UPDATE POST
const updatePost = (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const post = posts.find(p => p.id == id);

  if (!post) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  // Only the author can edit
  if (post.authorId != req.user.id) {
    return res.status(403).json({
      message: "Not authorized to edit this post"
    });
  }

  if (!title || !content) {
    return res.status(400).json({
      message: "Title and content are required"
    });
  }

  post.title = title;
  post.content = content;

  res.json({
    message: "Post updated successfully",
    post
  });
};


// DELETE POST
const deletePost = (req, res) => {
  const { id } = req.params;

  const post = posts.find(p => p.id == id);

  if (!post) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  // Only the author can delete
  if (post.authorId != req.user.id) {
    return res.status(403).json({
      message: "Not authorized to delete this post"
    });
  }

  posts = posts.filter(p => p.id != id);

  res.json({
    message: "Post deleted successfully"
  });
};


module.exports = {
  createPost,
  getPosts,
  updatePost,
  deletePost
};