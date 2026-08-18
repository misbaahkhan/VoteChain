import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/globals.css";

export default function StudentResetPassword() {
  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const email =
    sessionStorage.getItem(
      "votechain_reset_email"
    );

  const verified =
    sessionStorage.getItem(
      "votechain_reset_verified"
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // ==========================================
    // CHECK RESET SESSION
    // ==========================================

    if (!email || verified !== "true") {
      setError(
        "Your password reset session is invalid. Please start again."
      );
      return;
    }

    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/students/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            newPassword,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset password."
        );
        return;
      }

      setMessage(
        "Password reset successfully. Redirecting to login..."
      );

      // ==========================================
      // CLEAR RESET SESSION
      // ==========================================

      sessionStorage.removeItem(
        "votechain_reset_email"
      );

      sessionStorage.removeItem(
        "votechain_reset_verified"
      );

      // ==========================================
      // REDIRECT
      // ==========================================

      setTimeout(() => {
        navigate("/student-login");
      }, 1500);

    } catch (error) {
      console.error(
        "Student Reset Password Error:",
        error
      );

      setError(
        "Unable to connect to VoteChain server."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="votechain-page">

      <div className="votechain-background" />

      <div className="login-overlay">

        <div className="login-card">

          {/* Close */}

          <button
            type="button"
            className="close-button"
            aria-label="Close"
            onClick={() =>
              navigate("/student-login")
            }
          >
            ×
          </button>

          {/* Heading */}

          <h2 className="login-title">
            Create New Password
          </h2>

          <p className="login-subtitle">
            Student Voting Portal
          </p>

          <p
            style={{
              color:
                "rgba(255,255,255,0.55)",
              fontSize: "13px",
              lineHeight: "1.6",
              marginBottom: "22px",
            }}
          >
            Create a new password for your
            VoteChain account.
          </p>

          {/* Error */}

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          {/* Success */}

          {message && (
            <p
              style={{
                color: "#86efac",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {message}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
          >

            {/* New Password */}

            <label
              htmlFor="newPassword"
              className="login-label"
            >
              New Password
            </label>

            <div className="password-wrapper">

              <input
                id="newPassword"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                className="login-input password-input"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* Confirm Password */}

            <label
              htmlFor="confirmPassword"
              className="login-label"
            >
              Confirm Password
            </label>

            <div className="password-wrapper">

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                className="login-input password-input"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* Reset Password */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}