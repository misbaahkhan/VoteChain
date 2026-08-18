import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/add-admin.css";

export default function AddAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (
      !formData.employeeId ||
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    // =================================================
    // PASSWORD MATCH
    // =================================================

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    // =================================================
    // PASSWORD LENGTH
    // =================================================

    if (
      formData.password.length < 6
    ) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // GET SUPER ADMIN TOKEN
      // =================================================

      const token =
        sessionStorage.getItem(
          "votechain_token"
        ) ||
        localStorage.getItem(
          "votechain_token"
        );

      if (!token) {
        navigate("/");
        return;
      }

      // =================================================
      // API REQUEST
      // =================================================

      const response =
        await fetch(
          "http://localhost:5000/api/admin/create-admin",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              employeeId:
                formData.employeeId.trim(),

              fullName:
                formData.fullName.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              password:
                formData.password,
            }),
          }
        );

      const data =
        await response.json();

      // =================================================
      // API ERROR
      // =================================================

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create admin."
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "New admin created successfully."
      );

      // Clear form
      setFormData({
        employeeId: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {

      console.error(
        "Create Admin Error:",
        error
      );

      setError(
        "Unable to connect to VoteChain server."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    sessionStorage.removeItem(
      "votechain_token"
    );

    sessionStorage.removeItem(
      "votechain_admin"
    );

    localStorage.removeItem(
      "votechain_token"
    );

    localStorage.removeItem(
      "votechain_admin"
    );

    navigate("/");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="add-admin-page">

      <div className="add-admin-bg" />

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="add-admin-navbar glass-add-admin">

        <div className="add-admin-brand">

          <div className="add-admin-logo">
            <img
  src="/votechain-logo.png"
  alt="VoteChain"
  className="votechain-logo"
/>
          </div>


          <div>
            <h1>
              VoteChain
            </h1>

            <span>
              ADMIN PORTAL
            </span>
          </div>

        </div>

        <div className="add-admin-nav-actions">

          <button
            type="button"
            className="add-admin-back"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="add-admin-logout"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>

        </div>

      </header>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <section className="add-admin-content">

        <div className="add-admin-heading">

          <p className="add-admin-eyebrow">
            ADMINISTRATION
          </p>

          <h2>
            Add New Admin
          </h2>

          <p>
            Create a new administrator account
            for the VoteChain platform.
          </p>

        </div>

        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          className="add-admin-form glass-add-admin"
          onSubmit={handleSubmit}
        >

          {/* ================================================= */}
          {/* ACCOUNT INFORMATION */}
          {/* ================================================= */}

          <div className="add-admin-section">

            <div className="add-admin-section-heading">

              <div>
                <h3>
                  Administrator Details
                </h3>

                <p>
                  Enter the details of the new
                  administrator.
                </p>
              </div>

              <span>
                01
              </span>

            </div>

            {/* Employee ID */}

            <div className="add-admin-form-group">

              <label htmlFor="employeeId">
                Employee ID
              </label>

              <input
                id="employeeId"
                name="employeeId"
                type="text"
                placeholder="Enter employee ID"
                value={
                  formData.employeeId
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Full Name */}

            <div className="add-admin-form-group">

              <label htmlFor="fullName">
                Full Name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter full name"
                value={
                  formData.fullName
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Email */}

            <div className="add-admin-form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* PASSWORD */}
          {/* ================================================= */}

          <div className="add-admin-section">

            <div className="add-admin-section-heading">

              <div>
                <h3>
                  Login Credentials
                </h3>

                <p>
                  Set the password for the new
                  administrator account.
                </p>
              </div>

              <span>
                02
              </span>

            </div>

            {/* Password */}

            <div className="add-admin-form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Confirm Password */}

            <div className="add-admin-form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={
                  formData.confirmPassword
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* MESSAGE */}
          {/* ================================================= */}

          {error && (
            <div className="add-admin-error">
              {error}
            </div>
          )}

          {success && (
            <div className="add-admin-success">
              {success}
            </div>
          )}

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="add-admin-actions">

            <button
              type="button"
              className="add-admin-cancel"
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-admin-submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Admin"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}