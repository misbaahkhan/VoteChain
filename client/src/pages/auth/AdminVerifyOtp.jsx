import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/globals.css";

export default function AdminVerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const email = sessionStorage.getItem(
    "votechain_admin_reset_email"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Password reset session not found. Please start again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError(
        "Please enter the 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid or expired OTP."
        );
        return;
      }

      setMessage(
        "OTP verified successfully."
      );

      sessionStorage.setItem(
        "votechain_admin_reset_verified",
        "true"
      );

      setTimeout(() => {
        navigate(
          "/admin/forgot-password/reset"
        );
      }, 700);

    } catch (error) {
      console.error(
        "Admin OTP Verification Error:",
        error
      );

      setError(
        "Unable to connect to VoteChain server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    sessionStorage.removeItem(
      "votechain_admin_reset_email"
    );

    sessionStorage.removeItem(
      "votechain_admin_reset_verified"
    );

    navigate(
      "/admin/forgot-password"
    );
  };

  const handleClose = () => {
    sessionStorage.removeItem(
      "votechain_admin_reset_email"
    );

    sessionStorage.removeItem(
      "votechain_admin_reset_verified"
    );

    navigate("/admin-login");
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
            onClick={handleClose}
          >
            ×
          </button>

          {/* Heading */}

          <h2 className="login-title">
            Verify OTP
          </h2>

          <p className="login-subtitle">
            Admin Portal
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
            Enter the 6-digit OTP sent to
            your registered admin email.
          </p>

          {/* Email */}

          {email && (
            <p
              style={{
                color:
                  "rgba(255,255,255,0.75)",
                fontSize: "13px",
                marginBottom: "18px",
                wordBreak: "break-word",
              }}
            >
              {email}
            </p>
          )}

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

            {/* OTP */}

            <label
              htmlFor="adminOtp"
              className="login-label"
            >
              Verification OTP
            </label>

            <input
              id="adminOtp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                setOtp(value);
              }}
              className="login-input"
              autoComplete="one-time-code"
              required
            />

            {/* Verify */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            {/* Change Email */}

            <div className="forgot-container">

              <button
                type="button"
                className="forgot-button"
                onClick={handleBack}
              >
                Change Email
              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}