import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/create-election.css";

export default function EditElection() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [voters, setVoters] =
    useState([]);

  const [selectedCandidates, setSelectedCandidates] =
    useState([]);

  // Candidate search
  const [candidateSearch, setCandidateSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
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
  // FORMAT DATE FOR DATETIME-LOCAL
  // =====================================================

  const formatDateTimeLocal = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    const year =
      d.getFullYear();

    const month =
      String(
        d.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        d.getDate()
      ).padStart(2, "0");

    const hours =
      String(
        d.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        d.getMinutes()
      ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // =====================================================
  // FETCH ELECTION
  // =====================================================

  const fetchElection = async () => {
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
            "Failed to load election."
        );

        return;
      }

      const election =
        data.election;

      // =================================================
      // FRONTEND STATUS CHECK
      // =================================================

      if (
        election.status !==
        "upcoming"
      ) {
        setError(
          "Only upcoming elections can be edited."
        );

        return;
      }

      // =================================================
      // SET EXISTING DATA
      // =================================================

      setTitle(
        election.title || ""
      );

      setDescription(
        election.description ||
          ""
      );

      setStartDate(
        formatDateTimeLocal(
          election.startDate
        )
      );

      setEndDate(
        formatDateTimeLocal(
          election.endDate
        )
      );

      setVoters(
        election.eligibleVoters ||
          []
      );

      setSelectedCandidates(
        (
          election.candidates ||
          []
        ).map(
          (candidate) =>
            candidate.studentId
        )
      );

    } catch (error) {
      console.error(
        "Fetch Election Error:",
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
      fetchElection();
    }
  }, [id]);

  // =====================================================
  // TOGGLE CANDIDATE
  // =====================================================

  const toggleCandidate = (
    studentId
  ) => {
    setSelectedCandidates(
      (previous) => {

        if (
          previous.includes(
            studentId
          )
        ) {
          return previous.filter(
            (id) =>
              id !== studentId
          );
        }

        return [
          ...previous,
          studentId,
        ];
      }
    );
  };

  // =====================================================
  // FILTER CANDIDATES
  // =====================================================

  const filteredCandidates = voters.filter((voter) => {
    const search = candidateSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return true;
    }

    return (
      voter.name?.toLowerCase().includes(search) ||
      voter.studentId?.toLowerCase().includes(search) ||
      voter.instituteEmail
        ?.toLowerCase()
        .includes(search) ||
      voter.department
        ?.toLowerCase()
        .includes(search) ||
      voter.year?.toLowerCase().includes(search) ||
      voter.division?.toLowerCase().includes(search)
    );
  });

  const selectedCandidateObjects =
    selectedCandidates
      .map((studentId) =>
        voters.find(
          (voter) =>
            voter.studentId === studentId
        )
      )
      .filter(Boolean);

  // =====================================================
  // SUBMIT UPDATE
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (
      !title.trim() ||
      !description.trim() ||
      !startDate ||
      !endDate
    ) {
      setError(
        "Please fill in all election details."
      );

      return;
    }

    if (
      selectedCandidates.length ===
      0
    ) {
      setError(
        "Please select at least one candidate."
      );

      return;
    }

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      setError(
        "Please enter valid dates."
      );

      return;
    }

    if (end <= start) {
      setError(
        "End date must be after start date."
      );

      return;
    }

    if (
      start <= new Date()
    ) {
      setError(
        "Start date must be in the future."
      );

      return;
    }

    // =================================================
    // TOKEN
    // =================================================

    const token =
      getToken();

    if (!token) {
      setError(
        "Admin session expired. Please login again."
      );

      navigate(
        "/admin/login"
      );

      return;
    }

    try {
      setSaving(true);

      // =================================================
      // UPDATE REQUEST
      // =================================================

      const response =
        await fetch(
          `http://localhost:5000/api/elections/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              title:
                title.trim(),

              description:
                description.trim(),

              startDate,

              endDate,

              candidates:
                selectedCandidates,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update election."
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Election updated successfully!"
      );

      setTimeout(() => {
        navigate(
          "/admin/elections"
        );
      }, 1000);

    } catch (error) {
      console.error(
        "Update Election Error:",
        error
      );

      setError(
        "Unable to connect to VoteChain server."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="create-election-page">

        <div className="create-election-bg" />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color:
              "rgba(255,255,255,0.55)",
            fontSize: "13px",
          }}
        >
          Loading election...
        </div>

      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="create-election-page">

      <div className="create-election-bg" />

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="create-election-navbar glass-create">

        <div className="create-brand">

          <div className="create-logo">
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
          className="back-dashboard"
          onClick={() =>
            navigate(
              "/admin/elections"
            )
          }
        >
          ← Back to Elections
        </button>

      </header>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <section className="create-election-content">

        <div className="create-heading">

          <p className="create-eyebrow">
            ELECTION MANAGEMENT
          </p>

          <h2>
            Edit Election
          </h2>

          <p>
            Update the election details
            and manage its candidates.
          </p>

        </div>

        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          className="election-form glass-create"
          onSubmit={
            handleSubmit
          }
        >

          {/* ================================================= */}
          {/* SECTION 01 */}
          {/* ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <div>

                <h3>
                  Election Details
                </h3>

                <p>
                  Update the basic
                  information about
                  this election.
                </p>

              </div>

              <span>
                01
              </span>

            </div>

            {/* TITLE */}

            <div className="form-group">

              <label>
                Election Name
              </label>

              <input
                type="text"
                placeholder="Enter election name"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

            </div>

            {/* DESCRIPTION */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                placeholder="Describe this election..."
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

            </div>

          </section>

          {/* ================================================= */}
          {/* SECTION 02 */}
          {/* ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <div>

                <h3>
                  Voting Period
                </h3>

                <p>
                  Update when students
                  can vote.
                </p>

              </div>

              <span>
                02
              </span>

            </div>

            <div className="date-grid">

              {/* START */}

              <div className="form-group">

                <label>
                  Start Date
                </label>

                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* END */}

              <div className="form-group">

                <label>
                  End Date
                </label>

                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* SECTION 03 */}
          {/* ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <div>

                <h3>
                  Eligible Voters
                </h3>

                <p>
                  These students are
                  already eligible for
                  this election.
                </p>

              </div>

              <span>
                03
              </span>

            </div>

            <div className="voter-summary">

              <strong>
                {voters.length}
              </strong>

              <span>
                eligible voters
              </span>

            </div>

            <p
              style={{
                marginTop:
                  "10px",
                color:
                  "rgba(255,255,255,0.4)",
                fontSize:
                  "10px",
              }}
            >
              Eligible voters cannot
              be changed while editing
              an election.
            </p>

          </section>

          {/* ================================================= */}
          {/* SECTION 04 */}
          {/* ================================================= */}

          <section className="form-section">

            <div className="section-heading">

              <div>

                <h3>
                  Candidates
                </h3>

                <p>
                  Select candidates from
                  this election's eligible
                  voters.
                </p>

              </div>

              <span>
                04
              </span>

            </div>

            {/* CANDIDATE COUNT */}

            <div className="candidate-info">

              <span>
                {
                  selectedCandidates.length
                }
              </span>

              <p>
                candidate
                {selectedCandidates.length !==
                1
                  ? "s"
                  : ""}{" "}
                selected
              </p>

            </div>

            {/* SEARCH CANDIDATES */}

            <div className="candidate-search">
              <span className="candidate-search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by name, student ID, email, department..."
                value={candidateSearch}
                onChange={(e) =>
                  setCandidateSearch(
                    e.target.value
                  )
                }
              />

              {candidateSearch && (
                <button
                  type="button"
                  className="candidate-search-clear"
                  onClick={() =>
                    setCandidateSearch("")
                  }
                  aria-label="Clear candidate search"
                >
                  ×
                </button>
              )}
            </div>

            <p className="candidate-search-result">
              Showing{" "}
              <strong>
                {filteredCandidates.length}
              </strong>{" "}
              of {voters.length} eligible voters
            </p>

            {/* SELECTED CANDIDATES */}

            {selectedCandidateObjects.length >
              0 && (
              <div className="selected-candidates">
                <div className="selected-candidates-heading">
                  <strong>
                    Selected Candidates
                  </strong>

                  <span>
                    {selectedCandidateObjects.length}
                  </span>
                </div>

                <div className="selected-candidate-list">
                  {selectedCandidateObjects.map(
                    (candidate) => (
                      <div
                        className="selected-candidate-chip"
                        key={
                          candidate.studentId
                        }
                      >
                        <div>
                          <strong>
                            {candidate.name}
                          </strong>

                          <span>
                            {candidate.studentId}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleCandidate(
                              candidate.studentId
                            )
                          }
                          aria-label={`Remove ${candidate.name}`}
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* CANDIDATE LIST */}

            <div className="candidate-list">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map(
                  (voter) => {
                    const isSelected =
                      selectedCandidates.includes(
                        voter.studentId
                      );

                    return (
                      <button
                        key={voter.studentId}
                        type="button"
                        className={`candidate-option ${
                          isSelected
                            ? "candidate-selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleCandidate(
                            voter.studentId
                          )
                        }
                      >
                        <div className="candidate-check">
                          {isSelected
                            ? "✓"
                            : ""}
                        </div>

                        <div className="candidate-details">
                          <strong>
                            {voter.name}
                          </strong>

                          <span>
                            {voter.studentId}
                          </span>

                          <small>
                            {voter.year} •{" "}
                            {voter.department} •{" "}
                            {voter.division}
                          </small>
                        </div>
                      </button>
                    );
                  }
                )
              ) : (
                <div className="candidate-no-results">
                  <strong>
                    No eligible voters found
                  </strong>

                  <span>
                    Try a different name, student ID,
                    email, department, year or division.
                  </span>
                </div>
              )}
            </div>

            <p className="candidate-note">
              Only students already included in this
              election's eligible voter list can be
              selected as candidates. Search to quickly
              find a student and click their row to
              select or remove them.
            </p>

          </section>

          {/* ================================================= */}
          {/* MESSAGES */}
          {/* ================================================= */}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate(
                  "/admin/elections"
                )
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-button"
              disabled={saving}
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes →"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}