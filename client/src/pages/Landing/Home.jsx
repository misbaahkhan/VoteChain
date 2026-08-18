import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="votechain-home">

      {/* ================= BACKGROUND ================= */}

      <div className="home-background" />

      <div className="home-overlay" />

      {/* ================= HEADER ================= */}

      <header className="home-header glassmorphism">

        <div className="brand">
          <div className="brand-mark">
            <img
  src="/votechain-logo.png"
  alt="VoteChain"
  className="votechain-logo"
/>
          </div>

          <div>
            <h1>VoteChain</h1>
            <span>SECURE DIGITAL ELECTIONS</span>
          </div>
        </div>

        <div className="header-status">
          <span className="status-dot" />
          Secure Voting Platform
        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="home-content">

        <div className="hero-content">

          <p className="eyebrow">
            WELCOME TO VOTECHAIN
          </p>

          <h2>
            Your Vote.
            <br />
            <span>Your Voice.</span>
          </h2>

          <p className="hero-description">
            A secure and transparent digital voting platform
            designed to make elections simple, trusted and accessible.
          </p>

        </div>

        {/* ================= ROLE CARDS ================= */}

        <div className="role-section">

          <p className="choose-text">
            Continue as
          </p>

          <div className="role-cards">

            {/* ADMIN */}

            <button
              className="role-card glassmorphism"
              onClick={() => navigate("/admin-login")}
            >

              <div className="role-icon admin-icon">
                <span>♙</span>
              </div>

              <div className="role-info">

                <h3>
                  Admin
                </h3>

                <p>
                  Manage elections, candidates,
                  students and voting activity.
                </p>

              </div>

              <div className="role-arrow">
                →
              </div>

            </button>

            {/* STUDENT */}

            <button
              className="role-card glassmorphism"
              onClick={() => navigate("/student-login")}
            >

              <div className="role-icon student-icon">
                <span>♙</span>
              </div>

              <div className="role-info">

                <h3>
                  Student
                </h3>

                <p>
                  View elections, cast your vote
                  and track your participation.
                </p>

              </div>

              <div className="role-arrow">
                →
              </div>

            </button>

          </div>

        </div>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="home-footer">

        <span>
          Secure
        </span>

        <span>•</span>

        <span>
          Transparent
        </span>

        <span>•</span>

        <span>
          Digital
        </span>

        <span>•</span>

        <span>
          VoteChain
        </span>

      </footer>

    </div>
  );
}