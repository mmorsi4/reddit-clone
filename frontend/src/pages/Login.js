import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Login() {
  const [activeForm, setActiveForm] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [PassFocused, setPassFocused] = useState(false);
  const [NameFocused, setNameFocused] = useState(false);
  const [EmailFocused, setEmailFocused] = useState(false);
  const [valid, setValid] = useState(true);

  const WarningIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      className="icon-warn"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="#ff4d4d" strokeWidth="2" />
      <path d="M12 8V12" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="#ff4d4d" />
    </svg>
  );

  const SuccessIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      className="icon-success"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 13L9 17L19 7" stroke="#28a745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/> 
    </svg>
  );

  
  // Toggle password visibility
  const togglePassword = () => setShowPassword((prev) => !prev);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const usernameOrEmail = e.target.elements["login-username-email"].value.trim();
    const password = e.target.elements["login-password"].value.trim();
    setIsSubmitted(true);
    
    // Validation
    if (usernameOrEmail === "" || password === "") {
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
        // HANDLE SUCCESSFUL LOGIN
        navigate("/home");
      } 
      else {
        setValid(false);
        alert(res.status || "Invalid credentials.");
        alert(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    const username = e.target.elements["signup-username"].value.trim();
    const email = e.target.elements["signup-email"].value.trim();
    const password = e.target.elements["signup-password"].value.trim();

    // Validation
    if (username === "" || email === "" || password === "") {
      setIsSubmitted(true);
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
      <div className="auth-page">
        <div className="head">
          <Link to="/">
            <img src="../images/reddit-logo.png" className="reddit-logo" alt="Reddit Logo" />
          </Link>
        </div>

        {/* AUTH BOX */}
        <div className="login-container">
          <div className={activeForm === "login" ? "login-box" : "signup-box"}>
            
            {/* Login Form */}
            {activeForm === "login" && (
              <form className="login-form login-active" id="login-form" onSubmit={handleLogin}>
                <h2>Log In</h2>
                <p>By continuing, you agree to our <a href="https://redditinc.com/policies/user-agreement">User Agreement</a> and
                  acknowledge that you understand the <a href="https://www.reddit.com/policies/privacy-policy">Privacy Policy</a>.</p>

                <div className="inputbox">
                  <input
                    id="login-username-email"
                    type="text"
                    className={isSubmitted && !name && !NameFocused ? "warning" : ""}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder="Email or username"
                    onChange={(e) => setName(e.target.value)}
                  />
                  {isSubmitted && !name && !NameFocused && <WarningIcon />}
                  {name && !NameFocused && <SuccessIcon />}
                  <p className={`warn ${isSubmitted && !name && !NameFocused ? "show" : ""}`}>Please fill out this field.</p>
                </div>
                
                <div className="inputbox">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className={isSubmitted && !pass && !PassFocused ? "warning" : ""}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    placeholder="Password"
                    onChange={(e) => {setPass(e.target.value); setValid(true)}}
                  />
                  {isSubmitted && !pass && !PassFocused && <WarningIcon />}
                  {pass && !PassFocused && <SuccessIcon />}
                  <p className={`warn ${isSubmitted && !pass && !PassFocused ? "show" : ""}`}>
                    {isSubmitted && pass && !valid ? "Invalid username or password." : "Please fill out this field."}
                  </p>
                </div>

                <p className="login-switch-text">
                  <span>Forgot Password?</span>
                </p>
                <p className="login-switch-text">
                  New to Reddit?{" "}
                  <span onClick={() => {setActiveForm("signup"); setIsSubmitted(false) }}>Sign up</span>
                </p>
                <button type="submit" className={(!pass || !name) ? "login-button" : "login-btn"}>Log In</button>
              </form>
            )}

            {/* Signup Form */}
            {activeForm === "signup" && (
              <form className="login-form login-active" id="signup-form" onSubmit={handleSignup}>
                <h2>Sign Up</h2>
                <p>By continuing, you agree to our <a href="https://redditinc.com/policies/user-agreement">User Agreement</a> and
                  acknowledge that you understand the <a href="https://www.reddit.com/policies/privacy-policy">Privacy Policy</a>.</p>
                
                <div className="inputbox">
                  <input 
                    id="signup-username"
                    type="text"
                    className={isSubmitted && !name && !NameFocused ? "warning" : ""}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Username"
                  />
                  {isSubmitted && !name && !NameFocused && <WarningIcon />}
                  <p className={`warn ${isSubmitted && !name && !NameFocused ? "show" : ""}`}>Please fill out this field.</p>
                </div>
                
                <div className="inputbox">
                  <input
                    id="signup-email"
                    type="email"
                    className={isSubmitted && !email && !EmailFocused ? "warning" : ""}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                  {isSubmitted && !email && !EmailFocused && <WarningIcon />}
                  <p className={`warn ${isSubmitted && !email && !EmailFocused ? "show" : ""}`}>Please fill out this field.</p>
                </div>

                <div className="inputbox">
                  <input
                    id="signup-password"
                    type="password"
                    className={isSubmitted && !pass && !PassFocused ? "warning" : ""}
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="Password (min 6 chars)"
                  />
                  {isSubmitted && !pass && !PassFocused && <WarningIcon />}
                  <p className={`warn ${isSubmitted && !pass && !PassFocused ? "show" : ""}`}>Please fill out this field.</p>
                </div>

                <p className="login-switch-text">
                  Already a redditor?{" "}
                  <span onClick={() => {setActiveForm("login"); setIsSubmitted(false); setName(""); setPass("")}}>Log In</span>
                </p>
                <button type="submit" className={(!pass || !name || !email) ? "login-button" : "login-btn"}>Sign Up</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;