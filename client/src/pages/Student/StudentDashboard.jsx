import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/student-dashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  const [elections, setElections] =
    useState([]);

  const [loadingElections, setLoadingElections] =
    useState(true);

  const [electionError, setElectionError] =
    useState("");

  // =====================================================
  // LOAD STUDENT DATA
  // =====================================================

  useEffect(() => {
    const studentData =
      sessionStorage.getItem(
        "votechain_student"
      ) ||
      localStorage.getItem(
        "votechain_student"
      );

    if (studentData) {
      try {
        setStudent(
          JSON.parse(studentData)
        );
      } catch (error) {
        console.error(
          "Student data error:",
          error
        );
      }
    }
  }, []);

  // =====================================================
  // FETCH ELECTIONS
  // =====================================================

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoadingElections(true);
        setElectionError("");

        const token =
          sessionStorage.getItem(
            "votechain_student_token"
          ) ||
          localStorage.getItem(
            "votechain_student_token"
          );

        if (!token) {
          navigate("/student-login");
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/students/elections",
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setElectionError(
            data.message ||
              "Failed to load elections."
          );

          return;
        }

        setElections(
          data.elections || []
        );

      } catch (error) {
        console.error(
          "Fetch Elections Error:",
          error
        );

        setElectionError(
          "Unable to connect to VoteChain server."
        );

      } finally {
        setLoadingElections(false);
      }
    };

    fetchElections();
  }, [navigate]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    sessionStorage.removeItem(
      "votechain_student_token"
    );

    sessionStorage.removeItem(
      "votechain_student"
    );

    localStorage.removeItem(
      "votechain_student_token"
    );

    localStorage.removeItem(
      "votechain_student"
    );

    navigate("/");
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // STATUS TEXT
  // =====================================================

  const getStatusText = (
    status
  ) => {
    if (status === "active") {
      return "● ACTIVE";
    }

    if (status === "upcoming") {
      return "● UPCOMING";
    }

    if (status === "completed") {
      return "● COMPLETED";
    }

    return "● " +
      status.toUpperCase();
  };

  // =====================================================
  // COUNT VOTES CAST
  // =====================================================

  const votesCast =
    elections.filter(
      (election) =>
        election.hasVoted === true
    ).length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="student-dashboard">

      <div className="dashboard-bg" />

      {/* ================= NAVBAR ================= */}

      <header className="student-navbar glass-dashboard">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
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
              STUDENT PORTAL
            </span>
          </div>

        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>

      </header>

      {/* ================= CONTENT ================= */}

      <section className="dashboard-content">

        {/* ================= WELCOME ================= */}

        <div className="welcome-section">

          <p className="dashboard-eyebrow">
            STUDENT DASHBOARD
          </p>

          <h2>
            Welcome,

            <span>
              {" "}
              {student?.fullName ||
                "Student"}
            </span>
          </h2>

          <p>
            Participate in secure and
            transparent digital elections.
          </p>

        </div>

        {/* ================= GRID ================= */}

        <div className="dashboard-grid">

          {/* ================= PROFILE ================= */}

          <div className="student-info-card glass-dashboard">

            <div className="card-heading">

              <h3>
                Your Profile
              </h3>

            </div>

            <div className="profile-details">

              <div>
                <span>
                  Student ID
                </span>

                <strong>
                  {student?.studentId ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Email
                </span>

                <strong>
                  {student?.instituteEmail ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Department
                </span>

                <strong>
                  {student?.department ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Class
                </span>

                <strong>
                  {student?.className ||
                    "—"}
                </strong>
              </div>

            </div>

          </div>

          {/* ================= ELECTIONS ================= */}

          <div className="election-card glass-dashboard">

            <div className="election-top">

              <span className="active-badge">

                {loadingElections
                  ? "● LOADING"

                  : elections.length > 0
                  ? elections[0].hasVoted
                    ? "✓ VOTE CAST"
                    : getStatusText(
                        elections[0].status
                      )

                  : "● NO ELECTION"}

              </span>

              <span className="election-date">

                {elections.length > 0
                  ? formatDate(
                      elections[0]
                        .startDate
                    )
                  : ""}

              </span>

            </div>

            {loadingElections ? (

              <>
                <h3>
                  Loading Elections...
                </h3>

                <p>
                  Checking elections available
                  for your account.
                </p>
              </>

            ) : electionError ? (

              <>
                <h3>
                  Unable to Load Elections
                </h3>

                <p>
                  {electionError}
                </p>
              </>

            ) : elections.length === 0 ? (

              <>
                <h3>
                  No Elections Available
                </h3>

                <p>
                  There are currently no
                  elections available for you.
                </p>
              </>

            ) : (

              <>
                <h3>
                  {elections[0].title}
                </h3>

                <p>
                  {elections[0].description}
                </p>

                {/* ================= ALREADY VOTED ================= */}

                {elections[0].hasVoted && (

                  <button
                    type="button"
                    className="vote-button"
                    disabled
                  >
                    ✓ Vote Cast
                  </button>

                )}

                {/* ================= ACTIVE ================= */}

                {!elections[0].hasVoted &&
                  elections[0].status ===
                    "active" && (

                  <button
                    type="button"
                    className="vote-button"
                    onClick={() =>
                      navigate(
                        `/student/vote/${elections[0].id}`
                      )
                    }
                  >
                    Vote Now →
                  </button>

                )}

                {/* ================= UPCOMING ================= */}

                {!elections[0].hasVoted &&
                  elections[0].status ===
                    "upcoming" && (

                  <button
                    type="button"
                    className="vote-button"
                    disabled
                  >
                    Voting Not Started
                  </button>

                )}

                {/* ================= COMPLETED ================= */}

                {elections[0].status ===
                  "completed" && (

                  <button
                    type="button"
                    className="vote-button"
                    onClick={() =>
                      navigate(
                        `/student/results/${elections[0].id}`
                      )
                    }
                  >
                    View Results →
                  </button>

                )}

              </>

            )}

          </div>

        </div>

        {/* ================= ALL ELECTIONS ================= */}

        {!loadingElections &&
          elections.length > 1 && (

          <>

            <div className="welcome-section">

              <p className="dashboard-eyebrow">
                AVAILABLE ELECTIONS
              </p>

              <h2>
                Your Elections
              </h2>

              <p>
                Elections in which you are
                eligible to participate.
              </p>

            </div>

            <div className="dashboard-grid">

              {elections
                .slice(1)
                .map(
                  (election) => (

                    <div
                      key={
                        election.id
                      }
                      className="election-card glass-dashboard"
                    >

                      <div className="election-top">

                        <span className="active-badge">

                          {election.hasVoted
                            ? "✓ VOTE CAST"
                            : getStatusText(
                                election.status
                              )}

                        </span>

                        <span className="election-date">

                          {formatDate(
                            election.startDate
                          )}

                        </span>

                      </div>

                      <h3>
                        {election.title}
                      </h3>

                      <p>
                        {election.description}
                      </p>

                      {/* ================= ALREADY VOTED ================= */}

                      {election.hasVoted && (

                        <button
                          type="button"
                          className="vote-button"
                          disabled
                        >
                          ✓ Vote Cast
                        </button>

                      )}

                      {/* ================= ACTIVE ================= */}

                      {!election.hasVoted &&
                        election.status ===
                          "active" && (

                        <button
                          type="button"
                          className="vote-button"
                          onClick={() =>
                            navigate(
                              `/student/vote/${election.id}`
                            )
                          }
                        >
                          Vote Now →
                        </button>

                      )}

                      {/* ================= UPCOMING ================= */}

                      {!election.hasVoted &&
                        election.status ===
                          "upcoming" && (

                        <button
                          type="button"
                          className="vote-button"
                          disabled
                        >
                          Voting Not Started
                        </button>

                      )}

                      {/* ================= COMPLETED ================= */}

                      {election.status ===
                        "completed" && (

                        <button
                          type="button"
                          className="vote-button"
                          onClick={() =>
                            navigate(
                              `/student/results/${election.id}`
                            )
                          }
                        >
                          View Results →
                        </button>

                      )}

                    </div>

                  )
                )}

            </div>

          </>
        )}

        {/* ================= STATS ================= */}

        <div className="stats-grid">

          {/* AVAILABLE ELECTIONS */}

          <div className="stat-card glass-dashboard">

            <span className="stat-number">
              {elections.length
                .toString()
                .padStart(2, "0")}
            </span>

            <span className="stat-label">
              Available Elections
            </span>

          </div>

          {/* VOTES CAST */}

          <div className="stat-card glass-dashboard">

            <span className="stat-number">

              {votesCast
                .toString()
                .padStart(2, "0")}

            </span>

            <span className="stat-label">
              Votes Cast
            </span>

          </div>

          {/* VOTING STATUS */}

          <div className="stat-card glass-dashboard">

            <span className="stat-number">

              {elections.some(
                (election) =>
                  election.status ===
                  "active"
              )
                ? "Open"
                : "Closed"}

            </span>

            <span className="stat-label">
              Voting Status
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}