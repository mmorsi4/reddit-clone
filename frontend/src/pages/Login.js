import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

// test nothing vdsicusicwdijc
function Login() {
  const [activeForm, setActiveForm] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Load existing users from localStorage
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  // Toggle password visibility
  const togglePassword = () => setShowPassword((prev) => !prev);

  //  Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const usernameOrEmail = e.target.elements["login-username-email"].value.trim();
    const password = e.target.elements["login-password"].value.trim();

    // Validation
    if (usernameOrEmail === "" || password === "") {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Welcome back, ${data.user.username}!`);
        navigate("/home");
        //setTimeout(() => setActiveForm("login"), 1500);
      } else {
        alert(res.status || "Invalid credentials.");
        alert(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }

    // // Find matching user
    // const user = users.find(
    //   (u) =>
    //     (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
    //     u.password === password
    // );

    // if (user) {
    //   alert(`Welcome back, ${user.username}!`);
    //   navigate("/");
    // } else {
    //   alert("Invalid username/email or password. Try again!");
    // }
  };

  //  Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    const username = e.target.elements["signup-username"].value.trim();
    const email = e.target.elements["signup-email"].value.trim();
    const password = e.target.elements["signup-password"].value.trim();

    // Validation
    if (username === "" || email === "" || password === "") {
      alert("Please fill out all fields.");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully! Redirecting to Login...");
        setTimeout(() => setActiveForm("login"), 1500);
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }
  };

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
            <form className="login-form login-active" id="login-form" onSubmit={handleLogin}>
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
                />
              </div>
              <button type="submit" className="login-btn">Login</button>
              <p className="login-switch-text">
                Don’t have an account?{" "}
                <span onClick={() => setActiveForm("signup")}>Sign up</span>
              </p>
            </form>
          )}

          {/* 🟣 Signup Form */}
          {activeForm === "signup" && (
            <form className="login-form login-active" id="signup-form" onSubmit={handleSignup}>
              <h2>Create an Account</h2>
              <input id="signup-username" type="text" placeholder="Username" required />
              <input id="signup-email" type="email" placeholder="Email" required />
              <div className="login-password-field">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 6 chars)"
                  required
                />
                <img
                  src={showPassword ? "../images/eye-off.svg" : "../images/eye.svg"}
                  alt="Toggle password visibility"
                  className="login-toggle-password"
                  onClick={togglePassword}
                  style={{ cursor: "pointer" }}
                />
              </div>
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
