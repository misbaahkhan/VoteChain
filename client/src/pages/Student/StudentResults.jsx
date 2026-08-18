import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/globals.css";

export default function StudentResults() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("votechain_student_token") ||
          sessionStorage.getItem("votechain_student_token");

        if (!token) {
          navigate("/student-login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/students/elections/${electionId}/results`,
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
            data.message ||
              "Unable to fetch election results."
          );
          return;
        }

        setElection(data.election);
        setResults(data.results || []);
      } catch (err) {
        console.error(
          "Student Results Error:",
          err
        );

        setError(
          "Unable to connect to VoteChain server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId, navigate]);

  if (loading) {
    return (
      <main className="votechain-page">
        <div className="votechain-background" />

        <div className="login-overlay">
          <div className="login-card">
            <p className="login-subtitle">
              Loading election results...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="votechain-page">
        <div className="votechain-background" />

        <div className="login-overlay">
          <div className="login-card">
            <h2 className="login-title">
              Results Unavailable
            </h2>

            <p className="login-error">
              {error}
            </p>

            <button
              type="button"
              className="login-button"
              onClick={() =>
                navigate("/student/dashboard")
              }
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="votechain-page">
      <div className="votechain-background" />

      <div className="login-overlay">
        <div
          className="login-card"
          style={{
            maxWidth: "750px",
            width: "90%",
          }}
        >
          {/* Back Button */}

          <button
            type="button"
            className="close-button"
            onClick={() =>
              navigate("/student/dashboard")
            }
          >
            ×
          </button>

          {/* Heading */}

          <h2 className="login-title">
            Election Results
          </h2>

          {election && (
            <>
              <p className="login-subtitle">
                {election.title}
              </p>

              <p
                style={{
                  textAlign: "center",
                  marginBottom: "25px",
                  opacity: 0.8,
                }}
              >
                Final results after election completion
              </p>
            </>
          )}

          {/* Results */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {results.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  opacity: 0.8,
                }}
              >
                No candidates found.
              </p>
            ) : (
              results.map(
                (candidate, index) => (
                  <div
                    key={candidate.studentId}
                    style={{
                      padding: "18px 20px",
                      borderRadius: "14px",
                      background:
                        "rgba(255, 255, 255, 0.06)",
                      border:
                        "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "17px",
                        }}
                      >
                        {index === 0 &&
                        candidate.voteCount > 0
                          ? "🏆 "
                          : ""}
                        {candidate.name}
                      </div>

                      {candidate.position && (
                        <div
                          style={{
                            fontSize: "13px",
                            opacity: 0.65,
                            marginTop: "4px",
                          }}
                        >
                          {candidate.position}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      {candidate.voteCount}{" "}
                      {candidate.voteCount === 1
                        ? "Vote"
                        : "Votes"}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* Back */}

          <button
            type="button"
            className="login-button"
            style={{
              marginTop: "25px",
            }}
            onClick={() =>
              navigate("/student/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}