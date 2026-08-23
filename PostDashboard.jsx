import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "https://fullstackblog-backend.onrender.com";

function PostDashboard({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showMyPosts, setShowMyPosts] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/posts`);

      setPosts(response.data);
    } catch (error) {
      console.error("Fetch posts error:", error);

      showMessage("Unable to load posts.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showMessage(
        "Please enter both title and content.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        `${API_URL}/api/posts`,
        {
          title: title.trim(),
          content: content.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setContent("");

      showMessage("Post published successfully!");

      await fetchPosts();
    } catch (error) {
      console.error("Create post error:", error);

      showMessage(
        error.response?.data?.message ||
          "Unable to create post.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setMessage("");

    window.scrollTo({
      top: 180,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setMessage("");
  };

  const updatePost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showMessage(
        "Please enter both title and content.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${API_URL}/api/posts/${editingId}`,
        {
          title: title.trim(),
          content: content.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingId(null);
      setTitle("");
      setContent("");

      showMessage("Post updated successfully!");

      await fetchPosts();
    } catch (error) {
      console.error("Update post error:", error);

      showMessage(
        error.response?.data?.message ||
          "Unable to update post.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/api/posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (editingId === id) {
        cancelEdit();
      }

      showMessage("Post deleted successfully!");

      await fetchPosts();
    } catch (error) {
      console.error("Delete post error:", error);

      showMessage(
        error.response?.data?.message ||
          "Unable to delete post.",
        "error"
      );
    }
  };

  const myPosts = posts.filter(
    (post) =>
      String(post.authorId) ===
      String(user?.id)
  );

  const averageCharacters =
    posts.length > 0
      ? Math.round(
          posts.reduce(
            (total, post) =>
              total + (post.content?.length || 0),
            0
          ) / posts.length
        )
      : 0;

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (showMyPosts) {
      result = result.filter(
        (post) =>
          String(post.authorId) ===
          String(user?.id)
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (post) =>
          post.title
            ?.toLowerCase()
            .includes(query) ||
          post.content
            ?.toLowerCase()
            .includes(query) ||
          post.authorName
            ?.toLowerCase()
            .includes(query)
      );
    }

    return result;
  }, [posts, search, showMyPosts, user?.id]);

  return (
    <div className="dashboard">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="nav-brand">

          <div className="brand-icon">
            ✦
          </div>

          <span>BlogSpace</span>

        </div>

        <div className="nav-links">

          <button
            className="nav-link"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Dashboard
          </button>

          <button
            className="nav-link active"
            onClick={() =>
              document
                .getElementById("posts-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            My Posts
          </button>

        </div>

        <div className="nav-right">

          <button
            className="theme-btn"
            onClick={() =>
              setDarkMode(!darkMode)
            }
            title="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <div className="profile-area">

            <div className="profile-badge">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>

            <div className="user-info">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>Blogger</span>

            </div>

          </div>

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* MAIN */}

      <main className="dashboard-content">

        {/* HERO */}

        <section className="hero">

          <div className="hero-content">

            <span className="hero-label">
              YOUR WRITING SPACE
            </span>

            <h1>
              Welcome,{" "}
              {user?.name || "Writer"}!
            </h1>

            <p>
              Turn your thoughts into stories
              and share them with the world.
            </p>

          </div>

          <div className="hero-stars">
            <span>✦</span>
            <span>✧</span>
            <span>✦</span>
          </div>

        </section>

        {/* STATS */}

        <section className="stats-container">

          <div className="stat-card">

            <div className="stat-icon purple">
              📝
            </div>

            <div>

              <span className="stat-number">
                {posts.length}
              </span>

              <span className="stat-label">
                Total Posts
              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              ✍️
            </div>

            <div>

              <span className="stat-number">
                {myPosts.length}
              </span>

              <span className="stat-label">
                Your Posts
              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              💬
            </div>

            <div>

              <span className="stat-number">
                {averageCharacters}
              </span>

              <span className="stat-label">
                Avg. Characters
              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon yellow">
              ✨
            </div>

            <div>

              <span className="stat-number status-active">
                {posts.length > 0
                  ? "Active"
                  : "Start"}
              </span>

              <span className="stat-label">
                Blog Status
              </span>

            </div>

          </div>

        </section>

        {/* EDITOR */}

        <section className="editor-card">

          <div className="section-heading">

            <div>

              <span className="section-label">
                {editingId
                  ? "UPDATE"
                  : "CREATE"}
              </span>

              <h2>
                {editingId
                  ? "Edit your post"
                  : "Create a New Post"}
              </h2>

              <p>
                {editingId
                  ? "Make changes to your story."
                  : "Share something interesting with the community."}
              </p>

            </div>

            <div className="editor-icon">
              {editingId
                ? "✏️"
                : "📝"}
            </div>

          </div>

          <form
            className="post-form"
            onSubmit={
              editingId
                ? updatePost
                : createPost
            }
          >

            <div className="input-group">

              <label>
                Post Title
              </label>

              <input
                type="text"
                placeholder="Give your post a title..."
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />

            </div>

            <div className="input-group">

              <label>
                Post Content
              </label>

              <textarea
                placeholder="Write your story here..."
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
              />

            </div>

            <div className="form-footer">

              <span className="character-count">
                {content.length} characters
              </span>

              <div className="form-buttons">

                {editingId && (
                  <button
                    className="cancel-btn"
                    type="button"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}

                <button
                  className="primary-btn"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "✓ Update Post"
                    : "↑ Publish Post"}
                </button>

              </div>

            </div>

          </form>

          {message && (
            <div
              className={`status-message ${messageType}`}
            >

              <span>
                {messageType === "error"
                  ? "!"
                  : "✓"}
              </span>

              {message}

            </div>
          )}

        </section>

        {/* POSTS */}

        <section
          className="posts-section"
          id="posts-section"
        >

          <div className="posts-header">

            <div>

              <span className="section-label">
                COMMUNITY
              </span>

              <h2>
                Latest Posts
              </h2>

              <p>
                Discover stories and ideas
                from the community.
              </p>

            </div>

            <span className="post-count">
              {filteredPosts.length}{" "}
              {filteredPosts.length === 1
                ? "post"
                : "posts"}
            </span>

          </div>

          {/* SEARCH */}

          <div className="post-toolbar">

            <div className="search-box">

              <span className="search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search posts, authors or topics..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <button
              className={`filter-btn ${
                !showMyPosts
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setShowMyPosts(false)
              }
            >
              All
            </button>

            <button
              className={`filter-btn ${
                showMyPosts
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setShowMyPosts(true)
              }
            >
              My Posts
            </button>

          </div>

          {/* POSTS LIST */}

          {loading ? (

            <div className="empty-state">

              <div className="loading-spinner"></div>

              <h3>
                Loading posts...
              </h3>

              <p>
                Please wait while we fetch
                the latest posts.
              </p>

            </div>

          ) : filteredPosts.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📝
              </div>

              <h3>
                {search || showMyPosts
                  ? "No matching posts"
                  : "No posts yet"}
              </h3>

              <p>
                {search
                  ? "Try another search term."
                  : "Create your first post and start sharing your ideas."}
              </p>

            </div>

          ) : (

            <div className="posts-grid">

              {filteredPosts.map((post) => {

                const isOwner =
                  String(post.authorId) ===
                  String(user?.id);

                return (

                  <article
                    className="post-card"
                    key={post.id}
                  >

                    <div className="post-card-top">

                      <span className="post-tag">
                        BLOG POST
                      </span>

                      {isOwner && (
                        <span className="your-post">
                          YOUR POST
                        </span>
                      )}

                    </div>

                    <h3>
                      {post.title}
                    </h3>

                    <p className="post-content">
                      {post.content}
                    </p>

                    <button
                      className="read-more"
                      onClick={() => {

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });

                        startEdit(post);

                      }}
                    >
                      {isOwner
                        ? "View & Edit →"
                        : "Read post →"}
                    </button>

                    <div className="post-divider"></div>

                    <div className="post-meta">

                      <div className="author-info">

                        <div className="author-avatar">

                          {post.authorName
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}

                        </div>

                        <div>

                          <strong>
                            {post.authorName ||
                              "Unknown author"}
                          </strong>

                          <span>
                            {post.createdAt
                              ? new Date(
                                  post.createdAt
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "Recently"}
                          </span>

                        </div>

                      </div>

                    </div>

                    {isOwner && (

                      <div className="post-actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            startEdit(post)
                          }
                        >
                          ✏ Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deletePost(post.id)
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    )}

                  </article>

                );
              })}

            </div>

          )}

        </section>

      </main>

      <footer className="footer">

        <p>
          © 2026 BlogSpace · Built with React
          & Node.js
        </p>

      </footer>

    </div>
  );
}

export default PostDashboard;
