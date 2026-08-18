import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/election-details.css";

export default function ElectionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [election, setElection] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // GET ADMIN TOKEN
  // =====================================================

  const getToken = () => {
    return (
      sessionStorage.getItem(
        "votechain_token"
      ) ||
      localStorage.getItem(
        "votechain_token"
      )
    );
  };

  // =====================================================
  // FETCH ELECTION DETAILS
  // =====================================================

  const fetchElectionDetails =
    async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          getToken();

        if (!token) {
          navigate("/");
          return;
        }

        const response =
          await fetch(
            `http://localhost:5000/api/elections/${id}`,
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
          setError(
            data.message ||
              "Failed to load election details."
          );

          return;
        }

        setElection(
          data.election
        );

      } catch (error) {
        console.error(
          "Fetch Election Details Error:",
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
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (id) {
      fetchElectionDetails();
    }
  }, [id]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDateTime = (
    date
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (
    status
  ) => {
    switch (status) {
      case "active":
        return "● ACTIVE";

      case "upcoming":
        return "● UPCOMING";

      case "completed":
        return "● COMPLETED";

      case "draft":
        return "● DRAFT";

      default:
        return (
          "● " +
          status?.toUpperCase()
        );
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
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="election-details-page">

        <div className="election-details-bg" />

        <div className="election-details-loading">
          Loading election details...
        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !election) {
    return (
      <main className="election-details-page">

        <div className="election-details-bg" />

        <header className="election-details-navbar glass-election-details">

          <div className="details-brand">

            <div className="details-logo">
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

          <button
            type="button"
            className="details-back-button"
            onClick={() =>
              navigate(
                "/admin/elections"
              )
            }
          >
            ← Manage Elections
          </button>

        </header>

        <section className="election-details-content">

          <div className="details-error glass-election-details">

            <div className="details-error-icon">
              !
            </div>

            <h3>
              Unable to Load Election
            </h3>

            <p>
              {error ||
                "Election not found."}
            </p>

            <button
              type="button"
              className="details-primary-button"
              onClick={() =>
                navigate(
                  "/admin/elections"
                )
              }
            >
              ← Back to Elections
            </button>

          </div>

        </section>

      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="election-details-page">

      <div className="election-details-bg" />

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="election-details-navbar glass-election-details">

        <div className="details-brand">

          <div className="details-logo">
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

        <div className="details-nav-actions">

          <button
            type="button"
            className="details-back-button"
            onClick={() =>
              navigate(
                "/admin/elections"
              )
            }
          >
            ← Manage Elections
          </button>

          <button
            type="button"
            className="details-logout"
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

      <section className="election-details-content">

        {/* ================================================= */}
        {/* HEADING */}
        {/* ================================================= */}

        <div className="details-heading">

          <p className="details-eyebrow">
            ELECTION DETAILS
          </p>

          <div className="details-title-row">

            <div>

              <h2>
                {election.title}
              </h2>

              <p>
                {election.description}
              </p>

            </div>

            <span
              className={`details-status ${election.status}`}
            >
              {getStatusLabel(
                election.status
              )}
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* OVERVIEW CARDS */}
        {/* ================================================= */}

        <div className="details-overview-grid">

          <div className="details-stat glass-election-details">

            <span className="details-stat-number">
              {
                election
                  .eligibleVoters
                  ?.length || 0
              }
            </span>

            <span className="details-stat-label">
              Eligible Voters
            </span>

          </div>

          <div className="details-stat glass-election-details">

            <span className="details-stat-number">
              {
                election
                  .candidates
                  ?.length || 0
              }
            </span>

            <span className="details-stat-label">
              Candidates
            </span>

          </div>

          <div className="details-stat glass-election-details">

            <span className="details-stat-number">
              {election.status ===
              "active"
                ? "LIVE"
                : election.status
                    ?.charAt(0)
                    .toUpperCase() +
                  election.status?.slice(
                    1
                  )}
            </span>

            <span className="details-stat-label">
              Election Status
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* ELECTION PERIOD */}
        {/* ================================================= */}

        <div className="details-section glass-election-details">

          <div className="details-section-heading">

            <div>

              <h3>
                Election Period
              </h3>

              <p>
                Voting period configured
                for this election.
              </p>

            </div>

            <span>
              01
            </span>

          </div>

          <div className="details-date-grid">

            <div className="details-date-item">

              <span>
                Starts
              </span>

              <strong>
                {formatDateTime(
                  election.startDate
                )}
              </strong>

            </div>

            <div className="details-date-item">

              <span>
                Ends
              </span>

              <strong>
                {formatDateTime(
                  election.endDate
                )}
              </strong>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* CANDIDATES */}
        {/* ================================================= */}

        <div className="details-section glass-election-details">

          <div className="details-section-heading">

            <div>

              <h3>
                Candidates
              </h3>

              <p>
                Students contesting
                this election.
              </p>

            </div>

            <span>
              02
            </span>

          </div>

          {election.candidates?.length >
          0 ? (

            <div className="candidate-list">

              {election.candidates.map(
                (
                  candidate,
                  index
                ) => (

                  <div
                    key={
                      candidate.studentId ||
                      index
                    }
                    className="candidate-item"
                  >

                    <div className="candidate-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="candidate-info">

                      <h4>
                        {
                          candidate.name
                        }
                      </h4>

                      <p>
                        {
                          candidate.studentId
                        }
                      </p>

                    </div>

                    <div className="candidate-academic">

                      <span>
                        {
                          candidate.year
                        }
                      </span>

                      <span>
                        {
                          candidate.department
                        }
                      </span>

                      <span>
                        Division{" "}
                        {
                          candidate.division
                        }
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="details-empty">
              No candidates found.
            </div>

          )}

        </div>

        {/* ================================================= */}
        {/* ELIGIBLE VOTERS */}
        {/* ================================================= */}

        <div className="details-section glass-election-details">

          <div className="details-section-heading">

            <div>

              <h3>
                Eligible Voters
              </h3>

              <p>
                Students authorized to
                vote in this election.
              </p>

            </div>

            <span>
              03
            </span>

          </div>

          <div className="voter-summary">

            <div className="voter-summary-number">
              {
                election
                  .eligibleVoters
                  ?.length || 0
              }
            </div>

            <div>

              <strong>
                Eligible Students
              </strong>

              <p>
                These students are
                authorized to participate
                in this election.
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}