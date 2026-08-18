import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/student-vote.css";

export default function VotePage() {
  const navigate = useNavigate();
  const { electionId } = useParams();

  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // VOTING STATES
  // =====================================================

  const [submitting, setSubmitting] =
    useState(false);

  const [voteSubmitted, setVoteSubmitted] =
    useState(false);

  // =====================================================
  // VOTE CONFIRMATION MODAL
  // =====================================================

  const [showVoteConfirmation, setShowVoteConfirmation] =
    useState(false);

  const [candidateForConfirmation, setCandidateForConfirmation] =
    useState(null);

  // =====================================================
  // FETCH ELECTION
  // =====================================================

  useEffect(() => {
    const fetchElection = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          sessionStorage.getItem(
            "votechain_student_token"
          ) ||
          localStorage.getItem(
            "votechain_student_token"
          );

        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/students/elections/${electionId}`,
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
              "Unable to load election."
          );

          return;
        }

        setElection(
          data.election
        );

      } catch (err) {
        console.error(
          "Fetch Election Error:",
          err
        );

        setError(
          "Unable to connect to VoteChain server."
        );

      } finally {
        setLoading(false);
      }
    };

    if (electionId) {
      fetchElection();
    }

  }, [electionId, navigate]);

  // =====================================================
  // CONFIRM / CAST VOTE
  // =====================================================

  const handleConfirmVote =
    async () => {

      if (!selectedCandidate) {
        setError(
          "Please select a candidate before continuing."
        );

        return;
      }

      const candidate =
        election?.candidates?.find(
          (item) =>
            item.studentId ===
            selectedCandidate
        );

      if (!candidate) {
        setError(
          "Selected candidate could not be found."
        );

        return;
      }

      // =================================================
      // SHOW FRONTEND CONFIRMATION MODAL
      // =================================================

      setCandidateForConfirmation(candidate);
      setShowVoteConfirmation(true);

      return;

      try {
        setError("");
        setSubmitting(true);

        const token =
          sessionStorage.getItem(
            "votechain_student_token"
          ) ||
          localStorage.getItem(
            "votechain_student_token"
          );

        if (!token) {
          navigate("/");
          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/votes",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                electionId:
                  election.id,

                candidateStudentId:
                  candidate.studentId,
              }),
            }
          );

        const data =
          await response.json();

        // =================================================
        // BACKEND ERROR
        // =================================================

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to record vote."
          );

          return;
        }

        // =================================================
        // SUCCESS
        // =================================================

        setVoteSubmitted(true);

      } catch (err) {
        console.error(
          "Vote Submission Error:",
          err
        );

        setError(
          "Unable to connect to VoteChain server."
        );

      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // SUBMIT CONFIRMED VOTE
  // =====================================================

  const submitConfirmedVote = async () => {
    if (!candidateForConfirmation) {
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      setShowVoteConfirmation(false);

      const token =
        sessionStorage.getItem(
          "votechain_student_token"
        ) ||
        localStorage.getItem(
          "votechain_student_token"
        );

      if (!token) {
        navigate("/");
        return;
      }

      const response =
        await fetch(
          "http://localhost:5000/api/votes",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              electionId:
                election.id,

              candidateStudentId:
                candidateForConfirmation.studentId,
            }),
          }
        );

      const data =
        await response.json();

      // =================================================
      // BACKEND ERROR
      // =================================================

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to record vote."
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      setVoteSubmitted(true);

    } catch (err) {
      console.error(
        "Vote Submission Error:",
        err
      );

      setError(
        "Unable to connect to VoteChain server."
      );

    } finally {
      setSubmitting(false);
      setCandidateForConfirmation(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="student-vote-page">

        <div className="student-vote-bg" />

        <div className="vote-loading">
          Loading election...
        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !election) {
    return (
      <main className="student-vote-page">

        <div className="student-vote-bg" />

        <div className="vote-error-page">

          <div className="vote-error-card glass-vote">

            <h2>
              Unable to Load Election
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="vote-back-button"
              onClick={() =>
                navigate(
                  "/student/dashboard"
                )
              }
            >
              ← Back to Dashboard
            </button>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // VOTE SUCCESS
  // =====================================================

  if (voteSubmitted) {
    return (
      <main className="student-vote-page">

        <div className="student-vote-bg" />

        <div className="vote-error-page">

          <div className="vote-success-card glass-vote">

            <div className="vote-success-icon">
              ✓
            </div>

            <h2>
              Vote Recorded Successfully
            </h2>

            <p>
              Your vote for{" "}
              <strong>
                {
                  election?.candidates?.find(
                    (candidate) =>
                      candidate.studentId ===
                      selectedCandidate
                  )?.name
                }
              </strong>{" "}
              has been securely recorded.
            </p>

            <button
              type="button"
              className="vote-back-button"
              onClick={() =>
                navigate(
                  "/student/dashboard"
                )
              }
            >
              ← Back to Dashboard
            </button>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="student-vote-page">

      <div className="student-vote-bg" />

      {/* ================= NAVBAR ================= */}

      <header className="student-vote-navbar glass-vote">

        <div className="vote-brand">

          <div className="vote-logo">
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
          className="vote-back-button"
          onClick={() =>
            navigate(
              "/student/dashboard"
            )
          }
        >
          ← Dashboard
        </button>

      </header>

      {/* ================= CONTENT ================= */}

      <section className="student-vote-content">

        {/* ================= HEADER ================= */}

        <div className="vote-heading">

          <p className="vote-eyebrow">
            SECURE DIGITAL VOTING
          </p>

          <h2>
            {election?.title}
          </h2>

          <p>
            {election?.description}
          </p>

        </div>

        {/* ================= STATUS ================= */}

        <div className="vote-status-row">

          <span
            className={`vote-status ${
              election?.status
            }`}
          >
            ●{" "}
            {election?.status?.toUpperCase()}
          </span>

          <span className="vote-date">
            {new Date(
              election?.startDate
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}
          </span>

        </div>

        {/* ================= VOTING CARD ================= */}

        <div className="voting-card glass-vote">

          <div className="voting-card-heading">

            <div>

              <h3>
                Choose Your Candidate
              </h3>

              <p>
                Select one candidate to cast
                your vote.
              </p>

            </div>

            <span>
              {election?.candidates?.length ||
                0}{" "}
              Candidates
            </span>

          </div>

          {/* ================= CANDIDATES ================= */}

          <div className="vote-candidate-list">

            {election?.candidates?.length >
            0 ? (

              election.candidates.map(
                (candidate) => {

                  const isSelected =
                    selectedCandidate ===
                    candidate.studentId;

                  return (
                    <button
                      key={
                        candidate.studentId
                      }
                      type="button"
                      className={`vote-candidate ${
                        isSelected
                          ? "vote-candidate-selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedCandidate(
                          candidate.studentId
                        );

                        setError("");
                      }}
                      disabled={submitting}
                    >

                      <div className="vote-radio">

                        {isSelected && (
                          <span />
                        )}

                      </div>

                      <div className="vote-candidate-info">

                        <strong>
                          {candidate.name}
                        </strong>

                        <span>
                          {candidate.studentId}
                        </span>

                        <small>
                          {candidate.year}
                          {" • "}
                          {candidate.department}
                          {" • "}
                          {candidate.division}
                        </small>

                      </div>

                      {isSelected && (
                        <div className="selected-label">
                          SELECTED
                        </div>
                      )}

                    </button>
                  );
                }
              )

            ) : (

              <div className="no-candidates">
                No candidates have been added
                to this election.
              </div>

            )}

          </div>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="vote-form-error">
              {error}
            </div>
          )}

          {/* ================= ACTION ================= */}

          <div className="vote-action">

            <button
              type="button"
              className="confirm-vote-button"
              disabled={
                !selectedCandidate ||
                election?.status !==
                  "active" ||
                submitting
              }
              onClick={
                handleConfirmVote
              }
            >
              {submitting
                ? "Recording Vote..."
                : "Confirm Vote →"}
            </button>

          </div>

          {election?.status !==
            "active" && (

            <p className="voting-closed-message">

              Voting is currently{" "}
              {election?.status}.

              You can vote only when the
              election is active.

            </p>

          )}

        </div>

      </section>


      {/* =====================================================
          VOTE CONFIRMATION MODAL
          ===================================================== */}

      {showVoteConfirmation &&
        candidateForConfirmation && (
          <div
            className="vote-confirmation-overlay"
            onClick={() => {
              if (!submitting) {
                setShowVoteConfirmation(false);
                setCandidateForConfirmation(null);
              }
            }}
          >
            <div
              className="vote-confirmation-modal glass-vote"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="vote-confirmation-close"
                onClick={() => {
                  if (!submitting) {
                    setShowVoteConfirmation(false);
                    setCandidateForConfirmation(null);
                  }
                }}
                disabled={submitting}
              >
                ×
              </button>

              <div className="vote-confirmation-icon">
                ?
              </div>

              <div className="vote-confirmation-content">
                <p className="vote-confirmation-eyebrow">
                  SECURE DIGITAL VOTING
                </p>

                <h3>
                  Confirm Your Vote
                </h3>

                <p>
                  Are you sure you want to
                  vote for
                  <strong>
                    {" "}
                    {candidateForConfirmation.name}
                  </strong>
                  ?
                </p>

                <span className="vote-confirmation-warning">
                  Once submitted, your vote
                  cannot be changed.
                </span>
              </div>

              <div className="vote-confirmation-actions">
                <button
                  type="button"
                  className="vote-confirmation-cancel"
                  onClick={() => {
                    setShowVoteConfirmation(false);
                    setCandidateForConfirmation(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="vote-confirmation-submit"
                  onClick={submitConfirmedVote}
                  disabled={submitting}
                >
                  {submitting
                    ? "Recording Vote..."
                    : "Confirm Vote"}
                </button>
              </div>
            </div>
          </div>
        )}

    </main>
  );
}