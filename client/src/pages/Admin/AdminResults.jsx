import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-results.css";

export default function AdminResults() {
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // GET ADMIN TOKEN
  // =====================================================

  const getToken = () => {
    return (
      sessionStorage.getItem("votechain_token") ||
      localStorage.getItem("votechain_token")
    );
  };

  // =====================================================
  // FETCH ELECTIONS
  // =====================================================

  const fetchElections = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/votes/results/elections",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load elections."
        );
        return;
      }

      const electionList = data.elections || [];

      setElections(electionList);

      if (electionList.length > 0) {
        setSelectedElectionId(electionList[0]._id);
      }
    } catch (error) {
      console.error(
        "Fetch Result Elections Error:",
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
  // FETCH RESULTS
  // =====================================================

  const fetchResults = async (
    electionId,
    showLoader = true
  ) => {
    if (!electionId) {
      return;
    }

    try {
      if (showLoader) {
        setLoadingResults(true);
      }

      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/votes/results/${electionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load results."
        );
        return;
      }

      setResult(data.election);
      setError("");
    } catch (error) {
      console.error(
        "Fetch Results Error:",
        error
      );

      setError(
        "Unable to fetch live results."
      );
    } finally {
      if (showLoader) {
        setLoadingResults(false);
      }
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchElections();
  }, []);

  // =====================================================
  // LOAD SELECTED ELECTION
  // =====================================================

  useEffect(() => {
    if (!selectedElectionId) {
      setResult(null);
      return;
    }

    fetchResults(selectedElectionId);
  }, [selectedElectionId]);

  // =====================================================
  // LIVE AUTO REFRESH
  // =====================================================

  useEffect(() => {
    if (!selectedElectionId) {
      return;
    }

    const interval = setInterval(() => {
      fetchResults(selectedElectionId, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedElectionId]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusText = (status) => {
    if (status === "active") {
      return "● LIVE";
    }

    if (status === "upcoming") {
      return "● UPCOMING";
    }

    if (status === "completed") {
      return "● COMPLETED";
    }

    return "● " + status?.toUpperCase();
  };

  // =====================================================
  // STATUS CLASS / LABEL
  // =====================================================

  const getResultModeText = (status) => {
    if (status === "active") {
      return "● LIVE";
    }

    if (status === "completed") {
      return "● FINAL";
    }

    if (status === "upcoming") {
      return "● UPCOMING";
    }

    return "● RESULTS";
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    sessionStorage.removeItem("votechain_token");
    sessionStorage.removeItem("votechain_admin");

    localStorage.removeItem("votechain_token");
    localStorage.removeItem("votechain_admin");

    navigate("/");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="admin-results-page">
        <div className="admin-results-bg" />

        <div className="results-loading">
          Loading election results...
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <main className="admin-results-page">
      <div className="admin-results-bg" />

      {/* ================= NAVBAR ================= */}

      <header className="admin-results-navbar glass-results">
        <div className="results-brand">
          <div className="results-logo">
            VC
          </div>

          <div>
            <h1>VoteChain</h1>
            <span>ADMIN PORTAL</span>
          </div>
        </div>

        <div className="results-nav-actions">
          <button
            type="button"
            className="results-back-button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="results-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <section className="admin-results-content">
        {/* ================= HEADING ================= */}

        <div className="results-heading">
          <p className="results-eyebrow">
            ELECTION MONITORING
          </p>

          <h2>
            Election Results
          </h2>

          <p>
            Monitor voting activity and
            election results in real time.
          </p>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="results-error">
            {error}
          </div>
        )}

        {/* ================= SELECT ================= */}

        <div className="results-selector glass-results">
          <div>
            <label>
              Select Election
            </label>

            <p>
              Choose an election to view
              its results.
            </p>
          </div>

          <select
            value={selectedElectionId}
            onChange={(event) =>
              setSelectedElectionId(
                event.target.value
              )
            }
          >
            <option value="">
              Select an election
            </option>

            {elections.map((election) => (
              <option
                key={election._id}
                value={election._id}
              >
                {election.title}
              </option>
            ))}
          </select>
        </div>

        {/* ================= RESULTS ================= */}

        {loadingResults ? (
          <div className="results-loading-card glass-results">
            Loading results...
          </div>
        ) : result ? (
          <>
            {/* ================= ELECTION HEADER ================= */}

            <div className="results-election-header glass-results">
              <div>
                <div className="results-status-row">
                  <span
                    className={`results-status ${result.status}`}
                  >
                    {getStatusText(result.status)}
                  </span>

                  <span className="results-date">
                    {formatDate(result.startDate)}
                    {" → "}
                    {formatDate(result.endDate)}
                  </span>
                </div>

                <h3>
                  {result.title}
                </h3>

                <p>
                  {result.description}
                </p>
              </div>
            </div>

            {/* ================= STATS ================= */}

            <div className="results-stats-grid">
              <div className="result-stat glass-results">
                <span className="result-stat-number">
                  {result.totalVotes}
                </span>

                <span className="result-stat-label">
                  Total Votes
                </span>
              </div>

              <div className="result-stat glass-results">
                <span className="result-stat-number">
                  {result.eligibleVoters}
                </span>

                <span className="result-stat-label">
                  Eligible Voters
                </span>
              </div>

              <div className="result-stat glass-results">
                <span className="result-stat-number">
                  {result.turnout}%
                </span>

                <span className="result-stat-label">
                  Voter Turnout
                </span>
              </div>
            </div>

            {/* ================= CANDIDATES ================= */}

            <div className="candidate-results-card glass-results">
              <div className="candidate-results-heading">
                <div>
                  <h3>
                    Candidate Results
                  </h3>

                  <p>
                    {result.status === "active"
                      ? "Vote counts update automatically."
                      : result.status === "completed"
                      ? "Final vote counts for this election."
                      : "Voting has not started yet."}
                  </p>
                </div>

                <span
                  className={`live-indicator ${result.status}`}
                >
                  {getResultModeText(
                    result.status
                  )}
                </span>
              </div>

              {result.candidates?.length > 0 ? (
                <div className="candidate-results-list">
                  {(() => {
                    const maxVotes = Math.max(
                      ...result.candidates.map(
                        (candidate) =>
                          candidate.votes
                      )
                    );

                    const hasVotes =
                      result.totalVotes > 0;

                    return result.candidates.map(
                      (candidate, index) => {
                        const percentage =
                          result.totalVotes > 0
                            ? (
                                (candidate.votes /
                                  result.totalVotes) *
                                100
                              ).toFixed(1)
                            : "0.0";

                        const isLeader =
                          hasVotes &&
                          candidate.votes ===
                            maxVotes;

                        const tiedLeader =
                          isLeader &&
                          result.candidates.filter(
                            (item) =>
                              item.votes ===
                              maxVotes
                          ).length > 1;

                        return (
                          <div
                            key={
                              candidate.studentId
                            }
                            className={`candidate-result ${
                              isLeader
                                ? "candidate-leading"
                                : ""
                            }`}
                          >
                            <div className="candidate-result-top">
                              <div className="candidate-result-identity">
                                <div className="candidate-rank">
                                  {String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </div>

                                <div>
                                  <div className="candidate-name-row">
                                    <strong>
                                      {candidate.name}
                                    </strong>

                                    {isLeader && (
                                      <span className="leading-badge">
                                        {tiedLeader
                                          ? "TIED LEAD"
                                          : "LEADING"}
                                      </span>
                                    )}
                                  </div>

                                  <span>
                                    {candidate.studentId}
                                  </span>

                                  <small>
                                    {candidate.year}{" "}
                                    •{" "}
                                    {candidate.department}{" "}
                                    • Division{" "}
                                    {candidate.division}
                                  </small>
                                </div>
                              </div>

                              <div className="candidate-vote-count">
                                <strong>
                                  {candidate.votes}
                                </strong>

                                <span>
                                  votes
                                </span>
                              </div>
                            </div>

                            <div className="result-progress">
                              <div
                                className="result-progress-fill"
                                style={{
                                  width:
                                    `${percentage}%`,
                                }}
                              />
                            </div>

                            <div className="candidate-result-bottom">
                              <span>
                                {percentage}% of votes
                              </span>

                              {isLeader && (
                                <span className="leader-caption">
                                  {result.status ===
                                  "completed"
                                    ? "Highest final vote count"
                                    : "Currently leading"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    );
                  })()}
                </div>
              ) : (
                <div className="no-results">
                  No candidates found
                  for this election.
                </div>
              )}
            </div>

            {/* ================= LIVE / FINAL MESSAGE ================= */}

            {result.status === "active" && (
              <div className="results-live-message">
                <span>●</span>
                Live results refresh automatically.
              </div>
            )}

            {result.status === "completed" && (
              <div className="results-final-message">
                Final results — voting has ended.
              </div>
            )}

            {result.status === "upcoming" && (
              <div className="results-upcoming-message">
                Results will update once voting begins.
              </div>
            )}
          </>
        ) : (
          <div className="results-empty glass-results">
            <h3>
              No Election Selected
            </h3>

            <p>
              Select an election above
              to view its results.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
