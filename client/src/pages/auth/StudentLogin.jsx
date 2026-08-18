import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../../styles/globals.css";
import { useNavigate } from "react-router-dom";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!studentId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/students/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: studentId.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Invalid Student ID or Password."
        );
        return;
      }

      // Save JWT
      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "votechain_student_token",
        data.token
      );

      storage.setItem(
        "votechain_student",
        JSON.stringify(data.student)
      );

      console.log(
        "Student Login Successful:",
        data.student
      );

      // Redirect to Student Dashboard
      navigate("/student/dashboard");

    } catch (error) {
      console.error("Student Login Error:", error);

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
            onClick={() => {
              navigate("/");
            }}
          >
            ×
          </button>

          {/* Heading */}

          <h2 className="login-title">
            Login to VoteChain
          </h2>

          <p className="login-subtitle">
            Student Voting Portal
          </p>

          {/* Error */}

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>

            {/* Student ID */}

            <label
              htmlFor="studentId"
              className="login-label"
            >
              Student ID
            </label>

            <input
              id="studentId"
              type="text"
              placeholder="Enter Student ID"
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
              className="login-input"
              autoComplete="username"
              required
            />

            {/* Password */}

            <label
              htmlFor="studentPassword"
              className="login-label"
            >
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="studentPassword"
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
                autoComplete="current-password"
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

            {/* Remember Me */}

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

            {/* Login Button */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

            {/* Forgot Password */}

            <div className="forgot-container">

              <button
  type="button"
  className="forgot-button"
  onClick={() =>
    navigate("/student/forgot-password")
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