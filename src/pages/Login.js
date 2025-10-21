import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css"

function Login() {
  const [activeForm, setActiveForm] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Login successful!");
    navigate("/");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    alert("Account created successfully! Redirecting to Login...");
    setTimeout(() => navigate("/login"), 1500);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <Link to="/">
          <img src="../images/reddit-logo.png" className="reddit-logo" alt="Reddit Logo" />
        </Link>

      </div>

      {/* AUTH BOX */}
      <div className="login-container">
        <div className="login-box">
          <div className="login-tabs">
            <button
              className={`login-tab ${activeForm === "login" ? "active" : ""}`}
              onClick={() => setActiveForm("login")}
            >
              Login
            </button>
            <button
              className={`login-tab ${activeForm === "signup" ? "active" : ""}`}
              onClick={() => setActiveForm("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* 🟢 Login Form */}
          {activeForm === "login" && (
            <form
              className={`login-form ${activeForm === "login" ? "login-active" : ""}`}
              id="login-form"
              onSubmit={handleLogin}
            >
              <h2>Welcome Back!</h2>
              <input
                id="login-username-email"
                type="text"
                placeholder="Username or Email"
                required
              />
              <div className="login-password-field">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                />
                <img
                  src={showPassword ? "../images/eye-off.svg" : "../images/eye.svg"}
                  alt="Toggle password visibility"
                  className="login-toggle-password"
                  onClick={togglePassword}
                  style={{ cursor: "pointer" }}
                />              </div>
              <button type="submit" className="login-btn">Login</button>
              <p className="login-switch-text">
                Don’t have an account?{" "}
                <span onClick={() => setActiveForm("signup")}>Sign up</span>
              </p>
            </form>
          )}

          {/* 🟣 Signup Form */}
          {activeForm === "signup" && (
            <form
              className={`login-form ${activeForm === "signup" ? "login-active" : ""}`}
              id="signup-form"
              onSubmit={handleSignup}
            >
              <h2>Create an Account</h2>
              <input id="signup-username" type="text" placeholder="Username" required />
              <input id="signup-email" type="email" placeholder="Email" required />
              <div className="login-password-field">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                />
                <img
                  src={showPassword ? "../images/eye-off.svg" : "../images/eye.svg"}
                  alt="Toggle password visibility"
                  className="login-toggle-password"
                  onClick={togglePassword}
                  style={{ cursor: "pointer" }}
                />              </div>
              <button type="submit" className="login-btn">Sign Up</button>
              <p className="login-switch-text">
                Already have an account?{" "}
                <span onClick={() => setActiveForm("login")}>Login</span>
              </p>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}

export default Login;