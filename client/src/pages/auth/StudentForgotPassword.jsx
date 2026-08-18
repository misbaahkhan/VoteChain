import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/globals.css";

export default function StudentForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your institute email.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/students/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to process password reset."
        );
        return;
      }

      setMessage(
        data.message ||
          "If an account exists for this email, an OTP has been sent."
      );

      // OTP page next step mein banayenge.
      // Abhi email ko temporary state mein pass karenge.
      sessionStorage.setItem(
        "votechain_reset_email",
        email.trim().toLowerCase()
      );

      setTimeout(() => {
        navigate("/student/forgot-password/verify");
      }, 1000);

    } catch (error) {
      console.error(
        "Student Forgot Password Error:",
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
              navigate("/student/login")
            }
          >
            ×
          </button>

          {/* Heading */}

          <h2 className="login-title">
            Forgot Password
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
            Enter your registered institute
            email address and we'll send you
            a verification OTP.
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

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <label
              htmlFor="resetEmail"
              className="login-label"
            >
              Institute Email
            </label>

            <input
              id="resetEmail"
              type="email"
              placeholder="Enter registered institute email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="login-input"
              autoComplete="email"
              required
            />

            {/* Send OTP */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Sending OTP..."
                : "Send OTP"}
            </button>

            {/* Back to Login */}

            <div className="forgot-container">

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  navigate("/student-login")
                }
              >
                Back to Login
              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}