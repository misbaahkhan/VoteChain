import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/create-election.css";

export default function CreateElection() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [csvFile, setCsvFile] = useState(null);
  const [voters, setVoters] = useState([]);

  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // CSV FILE CHANGE
  // =====================================================

  const handleCsvChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setCsvFile(null);
      setVoters([]);
      setSelectedCandidates([]);
      setCandidateSearch("");
      return;
    }

    if (
      !file.name.toLowerCase().endsWith(".csv")
    ) {
      setError("Please upload a CSV file.");
      setCsvFile(null);
      setVoters([]);
      setSelectedCandidates([]);
      setCandidateSearch("");
      return;
    }

    setCsvFile(file);
    setError("");
    setSuccess("");

    try {
      const text = await file.text();

      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");

      if (lines.length < 2) {
        setError("The eligible voters CSV is empty.");
        setVoters([]);
        setSelectedCandidates([]);
        return;
      }

      // =================================================
      // PARSE HEADERS
      // =================================================

      const headers = lines[0]
        .split(",")
        .map((header) =>
          header
            .replace(/^\uFEFF/, "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
        );

      const parsedVoters = [];

      // =================================================
      // PARSE ROWS
      // =================================================

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(",")
          .map((value) => value.trim());

        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        if (
          Object.values(row).every(
            (value) => !String(value).trim()
          )
        ) {
          continue;
        }

        const studentId = (
          row.studentid ||
          row.student_id ||
          row.id ||
          ""
        ).trim();

        const name = (
          row.fullname ||
          row.name ||
          ""
        ).trim();

        const instituteEmail = (
          row.instituteemailid ||
          row.instituteemail ||
          row.email ||
          ""
        )
          .trim()
          .toLowerCase();

        const department = (
          row.department || ""
        ).trim();

        const year = (
          row.year || ""
        )
          .trim()
          .toUpperCase();

        const division = (
          row.division || ""
        )
          .trim()
          .toUpperCase();

        if (
          studentId &&
          name &&
          instituteEmail &&
          department &&
          year &&
          division
        ) {
          parsedVoters.push({
            studentId,
            name,
            instituteEmail,
            department,
            year,
            division,
          });
        }
      }

      setVoters(parsedVoters);
      setSelectedCandidates([]);
      setCandidateSearch("");

      if (parsedVoters.length === 0) {
        setError(
          "No valid students were found in the CSV."
        );
      } else {
        setSuccess(
          `${parsedVoters.length} eligible voters loaded successfully.`
        );
      }
    } catch (err) {
      console.error("CSV Read Error:", err);

      setError("Unable to read the CSV file.");

      setVoters([]);
      setSelectedCandidates([]);
      setCandidateSearch("");
    }
  };

  // =====================================================
  // SELECT / UNSELECT CANDIDATE
  // =====================================================

  const toggleCandidate = (studentId) => {
    setSelectedCandidates((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter(
          (id) => id !== studentId
        );
      }

      return [...previous, studentId];
    });
  };

  // =====================================================
  // CREATE ELECTION
  // =====================================================

  const handleSubmit = async (e) => {
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

    if (!csvFile) {
      setError(
        "Please upload the eligible voters CSV."
      );
      return;
    }

    if (voters.length === 0) {
      setError(
        "Please upload a valid eligible voters CSV."
      );
      return;
    }

    if (selectedCandidates.length === 0) {
      setError(
        "Please select at least one candidate."
      );
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      setError("Please enter valid dates.");
      return;
    }

    if (end <= start) {
      setError(
        "End date must be after start date."
      );
      return;
    }

    // =================================================
    // GET ADMIN TOKEN
    // =================================================

    const token =
      sessionStorage.getItem(
        "votechain_token"
      ) ||
      localStorage.getItem(
        "votechain_token"
      );

    if (!token) {
      setError(
        "Admin session expired. Please login again."
      );

      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // FORM DATA
      // =================================================

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "startDate",
        startDate
      );

      formData.append(
        "endDate",
        endDate
      );

      formData.append(
        "eligibleVotersCsv",
        csvFile
      );

      formData.append(
        "candidates",
        JSON.stringify(
          selectedCandidates
        )
      );

      // =================================================
      // API REQUEST
      // =================================================

      const response = await fetch(
        "http://localhost:5000/api/elections",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create election."
        );
        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "Election created successfully!"
      );

      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setCsvFile(null);
      setVoters([]);
      setSelectedCandidates([]);
      setCandidateSearch("");

      const fileInput =
        document.getElementById(
          "eligibleVotersCsv"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1200);
    } catch (err) {
      console.error(
        "Create Election Error:",
        err
      );

      setError(
        "Unable to connect to VoteChain server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER CANDIDATES
  // =====================================================

  const filteredCandidates =
    voters.filter((voter) => {
      const query =
        candidateSearch.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        voter.name
          .toLowerCase()
          .includes(query) ||
        voter.studentId
          .toLowerCase()
          .includes(query) ||
        voter.instituteEmail
          .toLowerCase()
          .includes(query)
      );
    });

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="create-election-page">

      {/* ================= BACKGROUND ================= */}

      <div className="create-election-bg" />

      {/* ================= NAVBAR ================= */}

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
            <h1>VoteChain</h1>
            <span>ADMIN PORTAL</span>
          </div>

        </div>

        <button
          type="button"
          className="back-dashboard"
          onClick={() =>
            navigate("/admin/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </header>

      {/* ================= CONTENT ================= */}

      <section className="create-election-content">

        {/* Heading */}

        <div className="create-heading">

          <p className="create-eyebrow">
            ELECTION MANAGEMENT
          </p>

          <h2>
            Create Election
          </h2>

          <p>
            Configure the election,
            eligible voters and candidates.
          </p>

        </div>

        {/* ================= FORM ================= */}

        <form
          className="election-form glass-create"
          onSubmit={handleSubmit}
        >

          {/* ================= SECTION 01 ================= */}

          <section className="form-section">

            <div className="section-heading">

              <div>
                <h3>
                  Election Details
                </h3>

                <p>
                  Enter the basic information
                  about your election.
                </p>
              </div>

              <span>
                01
              </span>

            </div>

            {/* Election Name */}

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

            {/* Description */}

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

          {/* ================= SECTION 02 ================= */}

          <section className="form-section">

            <div className="section-heading">

              <div>
                <h3>
                  Voting Period
                </h3>

                <p>
                  Define when students can vote.
                </p>
              </div>

              <span>
                02
              </span>

            </div>

            <div className="date-grid">

              {/* Start */}

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

              {/* End */}

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

          {/* ================= SECTION 03 ================= */}

          <section className="form-section">

            <div className="section-heading">

              <div>
                <h3>
                  Eligible Voters
                </h3>

                <p>
                  Upload the students eligible
                  to vote in this election.
                </p>
              </div>

              <span>
                03
              </span>

            </div>

            {/* CSV Upload */}

            <div className="csv-upload">

              <input
                id="eligibleVotersCsv"
                type="file"
                accept=".csv,text/csv"
                onChange={
                  handleCsvChange
                }
                hidden
              />

              <label
                htmlFor="eligibleVotersCsv"
                className="csv-dropzone"
              >

                <div className="upload-icon">
                  ↑
                </div>

                <strong>
                  {csvFile
                    ? csvFile.name
                    : "Upload Eligible Voters CSV"}
                </strong>

                <span>
                  Click to choose a CSV file
                </span>

              </label>

              <div className="csv-format">

                <span>
                  Required columns:
                </span>

                <code>
                  Student ID, Name,
                  Institute Email ID,
                  Department, Year, Division
                </code>

              </div>

            </div>

            {/* Loaded voters */}

            {voters.length > 0 && (
              <div className="voter-summary">

                <strong>
                  {voters.length}
                </strong>

                <span>
                  eligible voters loaded
                </span>

              </div>
            )}

          </section>

          {/* ================= SECTION 04 ================= */}

          {voters.length > 0 && (

            <section className="form-section">

              <div className="section-heading">

                <div>
                  <h3>
                    Candidates
                  </h3>

                  <p>
                    Select candidates from the
                    eligible voters of this election.
                  </p>
                </div>

                <span>
                  04
                </span>

              </div>

              {/* Candidate count */}

              <div className="candidate-info">

                <span>
                  {selectedCandidates.length}
                </span>

                <p>
                  candidate
                  {selectedCandidates.length !== 1
                    ? "s"
                    : ""}{" "}
                  selected
                </p>

              </div>

              {/* Candidate Search */}

              <div className="candidate-search">

                <span className="candidate-search-icon">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search eligible voters by name, Student ID or email..."
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
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

              </div>

              {/* Search Result Count */}

              <div className="candidate-search-result">
                Showing{" "}
                <strong>
                  {filteredCandidates.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {voters.length}
                </strong>{" "}
                eligible voters
              </div>

              {/* Selected Candidates */}

              {selectedCandidates.length > 0 && (
                <div className="selected-candidates">

                  <div className="selected-candidates-heading">
                    <strong>
                      Selected Candidates
                    </strong>

                    <span>
                      {selectedCandidates.length}
                    </span>
                  </div>

                  <div className="selected-candidate-list">

                    {selectedCandidates.map(
                      (studentId) => {
                        const candidate =
                          voters.find(
                            (voter) =>
                              voter.studentId ===
                              studentId
                          );

                        if (!candidate) {
                          return null;
                        }

                        return (
                          <div
                            key={candidate.studentId}
                            className="selected-candidate-chip"
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
                        );
                      }
                    )}

                  </div>

                </div>
              )}

              {/* Candidate List */}

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
                              {voter.instituteEmail}
                            </small>

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
                      Try searching by name, Student ID or institute email.
                    </span>
                  </div>
                )}

              </div>

              <p className="candidate-note">
                Only students included in this
                election's eligible voter list
                can be selected as candidates.
                Search makes it easier to find
                students in large voter lists.
              </p>

            </section>

          )}

          {/* ================= MESSAGES ================= */}

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

          {/* ================= ACTIONS ================= */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-button"
              disabled={loading}
            >
              {loading
                ? "Creating Election..."
                : "Create Election →"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}