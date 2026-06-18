import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultTexts } from "../themeConfig";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("cafeadmin@gmail.com");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [brandTitle, setBrandTitle] = useState(defaultTexts.heroTitle);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/look`)
      .then((res) => res.json())
      .then((data) => {
        const nextTitle = data?.texts?.heroTitle || data?.title;
        if (nextTitle) {
          setBrandTitle(nextTitle);
        }
      })
      .catch((err) => console.error("Error loading brand title:", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.mustChangePassword) {
          setMustChangePassword(true);
          setErrorMsg("");
          return;
        }

        onLogin();
        navigate("/home");
      } else {
        console.error("Login failed:", data);
        setErrorMsg(data.message || data.error || "Login failed. Please verify credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Network error. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currentPassword: password,
          newPassword,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        onLogin();
        navigate("/home");
      } else {
        setErrorMsg(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setErrorMsg("Network error. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#0c0a09", // Deep charcoal-espresso dark base
        fontFamily: "'Outfit', sans-serif",
        "--theme-primary": "#8B5A2B",
        "--theme-primary-hover": "#734a22",
        "--theme-primary-rgb": "139, 90, 43",
        "--theme-text-main": "#f3f4f6",
        "--theme-text-muted": "#9ca3af",
      }}
    >
      {/* Background blobs */}
      <div className="ambient-container" style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, zIndex: 0 }}>
        <div className="ambient-blob blob-1" style={{ opacity: 0.25 }}></div>
        <div className="ambient-blob blob-2" style={{ opacity: 0.15 }}></div>
        <div className="ambient-blob blob-3" style={{ opacity: 0.2 }}></div>
      </div>

      {/* Login Card */}
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px 32px",
          margin: "20px",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          backgroundColor: "rgba(30, 25, 22, 0.45)", // Semi-transparent dark mocha backdrop
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            {brandTitle}
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "0.95rem",
              color: "var(--theme-text-muted)",
            }}
          >
            {mustChangePassword ? "Set New Admin Password" : "Dashboard Admin Gateway"}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "0.85rem",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={mustChangePassword ? handleChangePassword : handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#e5e7eb" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mustChangePassword}
              className="glass-input"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
              }}
              placeholder="cafeadmin@gmail.com"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#e5e7eb" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={mustChangePassword}
              className="glass-input"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {mustChangePassword && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#e5e7eb" }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                  }}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "#e5e7eb" }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                  }}
                  placeholder="Confirm new password"
                  minLength={6}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="glass-btn glass-btn-primary"
            style={{
              marginTop: "8px",
              padding: "12px",
              fontSize: "1rem",
            }}
            disabled={loading}
          >
            {loading
              ? mustChangePassword
                ? "Saving..."
                : "Authenticating..."
              : mustChangePassword
                ? "Save Password"
                : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
