import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../../styles/globals.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!employeeId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "votechain_token",
        data.token
      );

      storage.setItem(
        "votechain_admin",
        JSON.stringify(data.admin)
      );

      console.log("Login successful", data);

      // Go to Admin Dashboard
      navigate("/admin/dashboard");

    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to VoteChain server."
      );
    }
  };

  return (
    <main className="votechain-page">

      {/* Dark overlay / background */}

      <div className="votechain-background" />

      {/* Login Modal */}

      <div className="login-overlay">

        <div className="login-card">

          {/* Close */}

          <button
            type="button"
            className="close-button"
            aria-label="Close"
            onClick={() => navigate("/")}
          >
            ×
          </button>

          {/* Heading */}

          <h2 className="login-title">
            Login to VoteChain
          </h2>

          <p className="login-subtitle">
            Secure Digital Voting Platform
          </p>

          {/* Error */}

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>

            {/* Employee ID */}

            <label
              htmlFor="employeeId"
              className="login-label"
            >
              Admin ID
            </label>

            <input
              id="employeeId"
              type="text"
              placeholder="Enter Admin ID"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(e.target.value)
              }
              className="login-input"
              required
            />

            {/* Password */}

            <label
              htmlFor="password"
              className="login-label"
            >
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="login-input password-input"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* Remember */}

            <div className="remember-row">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                />

                Remember Me

              </label>

            </div>

            {/* Login */}

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>

            {/* Forgot */}

            <div className="forgot-container">

             <button
  type="button"
  className="forgot-button"
  onClick={() =>
    navigate("/admin/forgot-password")
  }
>
  Forgot Password?
</button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}