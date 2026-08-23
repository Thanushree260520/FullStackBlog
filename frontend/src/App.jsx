import { useState } from "react";
import axios from "axios";
import PostDashboard from "./PostDashboard";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const url = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const data = isLogin
        ? { email, password }
        : { name, email, password };

      const response = await axios.post(url, data);

      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );

        setIsLoggedIn(true);
      } else {
        setMessage("Account created successfully! Please sign in.");

        setIsLogin(true);
        setName("");
        setPassword("");
      }

      setEmail("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <PostDashboard onLogout={logout} />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <span>BlogSpace</span>
        </div>

        <div className="auth-heading">
          <h1>
            {isLogin ? "Welcome back!" : "Create your account"}
          </h1>

          <p>
            {isLogin
              ? "Sign in to continue writing and sharing."
              : "Join BlogSpace and start sharing your ideas."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="primary-btn auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        {message && (
          <div
            className={`auth-message ${
              message.toLowerCase().includes("success")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        )}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          className="switch-btn"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
            setName("");
            setEmail("");
            setPassword("");
          }}
        >
          {isLogin
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>

        <p className="auth-footer">
          © 2026 BlogSpace. Write. Share. Inspire.
        </p>

      </div>
    </div>
  );
}

export default App;