import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin-elections.css";

export default function AdminElections() {
  const navigate = useNavigate();

  const [elections, setElections] =
    useState([]);

  const [activeFilter, setActiveFilter] =
    useState("all");

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
  // FETCH ELECTIONS
  // =====================================================

  const fetchElections = async () => {
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
          "http://localhost:5000/api/elections",
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

      setError(
        "Unable to connect to VoteChain server."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE MODAL STATE
  // =====================================================

  const [deleteElectionTarget, setDeleteElectionTarget] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteMessage, setDeleteMessage] =
    useState("");

  // =====================================================
  // OPEN DELETE MODAL
  // =====================================================

  const handleDeleteElection = (
    election
  ) => {
    setDeleteMessage("");
    setDeleteElectionTarget(election);
  };

  // =====================================================
  // CONFIRM DELETE ELECTION
  // =====================================================

  const confirmDeleteElection = async () => {
    if (!deleteElectionTarget) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteMessage("");

      const token =
        getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response =
        await fetch(
          `http://localhost:5000/api/elections/${deleteElectionTarget.id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setDeleteMessage(
          data.message ||
            "Failed to delete election."
        );

        return;
      }

      // Close modal
      setDeleteElectionTarget(null);

      // Refresh elections
      await fetchElections();

    } catch (error) {
      console.error(
        "Delete Election Error:",
        error
      );

      setDeleteMessage(
        "Unable to connect to VoteChain server."
      );

    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchElections();
  }, []);

  // =====================================================
  // FILTER ELECTIONS
  // =====================================================

  const filteredElections =
    elections.filter(
      (election) => {

        if (
          activeFilter ===
          "all"
        ) {
          return true;
        }

        return (
          election.status ===
          activeFilter
        );
      }
    );

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "—";
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
  // FORMAT DATE + TIME
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
  // STATUS
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
  // STATUS COUNT
  // =====================================================

  const getCount = (
    status
  ) => {

    if (
      status === "all"
    ) {
      return elections.length;
    }

    return elections.filter(
      (election) =>
        election.status ===
        status
    ).length;
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
      <main className="admin-elections-page">

        <div className="admin-elections-bg" />

        <div className="elections-loading">
          Loading elections...
        </div>

      </main>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <main className="admin-elections-page">

      <div className="admin-elections-bg" />

      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="admin-elections-navbar glass-elections">

        <div className="elections-brand">

          <div className="elections-logo">
            VC
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

        <div className="elections-nav-actions">

          <button
            type="button"
            className="elections-back-button"
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
            className="elections-logout"
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

      <section className="admin-elections-content">

        {/* ================================================= */}
        {/* HEADING */}
        {/* ================================================= */}

        <div className="elections-heading">

          <p className="elections-eyebrow">
            ELECTION MANAGEMENT
          </p>

          <h2>
            Manage Elections
          </h2>

          <p>
            View and monitor all elections
            created on VoteChain.
          </p>

        </div>

        {/* ================================================= */}
        {/* TOP ACTION */}
        {/* ================================================= */}

        <div className="elections-top-actions">

          <button
            type="button"
            className="create-election-button"
            onClick={() =>
              navigate(
                "/admin/elections/create"
              )
            }
          >
            + Create Election
          </button>

        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="elections-error">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <div className="election-filters glass-elections">

          <button
            type="button"
            className={
              activeFilter ===
              "all"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(
                "all"
              )
            }
          >
            All
            <span>
              {getCount("all")}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter ===
              "upcoming"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(
                "upcoming"
              )
            }
          >
            Upcoming
            <span>
              {getCount(
                "upcoming"
              )}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter ===
              "active"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(
                "active"
              )
            }
          >
            Active
            <span>
              {getCount("active")}
            </span>
          </button>

          <button
            type="button"
            className={
              activeFilter ===
              "completed"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setActiveFilter(
                "completed"
              )
            }
          >
            Completed
            <span>
              {getCount(
                "completed"
              )}
            </span>
          </button>

        </div>

        {/* ================================================= */}
        {/* ELECTION LIST */}
        {/* ================================================= */}

        {filteredElections.length ===
        0 ? (

          <div className="no-elections glass-elections">

            <div className="no-elections-icon">
              ◈
            </div>

            <h3>
              No Elections Found
            </h3>

            <p>
              There are no{" "}
              {activeFilter !== "all"
                ? activeFilter
                : ""}{" "}
              elections yet.
            </p>

            {/* ================================================= */}
            {/* CREATE BUTTON ONLY FOR ALL FILTER */}
            {/* ================================================= */}

            {activeFilter ===
              "all" && (

              <button
                type="button"
                className="create-election-button"
                onClick={() =>
                  navigate(
                    "/admin/elections/create"
                  )
                }
              >
                + Create Election
              </button>

            )}

          </div>

        ) : (

          <div className="elections-list">

            {filteredElections.map(
              (election) => (

                <div
                  key={
                    election.id
                  }
                  className="election-management-card glass-elections"
                >

                  {/* ================================================= */}
                  {/* CARD TOP */}
                  {/* ================================================= */}

                  <div className="management-card-top">

                    <span
                      className={`management-status ${election.status}`}
                    >
                      {getStatusLabel(
                        election.status
                      )}
                    </span>

                    <span className="management-date">
                      {formatDate(
                        election.startDate
                      )}
                    </span>

                  </div>

                  {/* ================================================= */}
                  {/* CARD CONTENT */}
                  {/* ================================================= */}

                  <div className="management-card-body">

                    <div className="management-main">

                      <h3>
                        {election.title}
                      </h3>

                      <p>
                        {election.description}
                      </p>

                    </div>

                    {/* ================================================= */}
                    {/* STATS */}
                    {/* ================================================= */}

                    <div className="management-stats">

                      <div>

                        <strong>
                          {
                            election.eligibleVoters
                          }
                        </strong>

                        <span>
                          Eligible Voters
                        </span>

                      </div>

                      <div>

                        <strong>
                          {
                            election.candidates
                          }
                        </strong>

                        <span>
                          Candidates
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* DATE DETAILS */}
                  {/* ================================================= */}

                  <div className="management-dates">

                    <div>

                      <span>
                        Starts
                      </span>

                      <strong>
                        {formatDateTime(
                          election.startDate
                        )}
                      </strong>

                    </div>

                    <div>

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

                  {/* ================================================= */}
                  {/* ACTIONS */}
                  {/* ================================================= */}

                  <div className="management-actions">

                    {election.status ===
                      "active" && (

                      <button
                        type="button"
                        className="management-primary-button"
                        onClick={() =>
                          navigate(
                            "/admin/results"
                          )
                        }
                      >
                        Live Results →
                      </button>

                    )}

                    {election.status ===
                      "completed" && (

                      <button
                        type="button"
                        className="management-primary-button"
                        onClick={() =>
                          navigate(
                            "/admin/results"
                          )
                        }
                      >
                        Final Results →
                      </button>

                    )}

                    
                {election.status ===
  "upcoming" && (

  <>
    <button
      type="button"
      className="management-secondary-button"
      onClick={() =>
        navigate(
          `/admin/elections/${election.id}`
        )
      }
    >
      View Details
    </button>

    <button
      type="button"
      className="management-primary-button"
      onClick={() =>
        navigate(
          `/admin/elections/${election.id}/edit`
        )
      }
    >
      Edit Election
    </button>

    <button
      type="button"
      className="management-danger-button"
      onClick={() =>
        handleDeleteElection(
          election
        )
      }
    >
      Delete
    </button>
  </>

)}

                    <button
                      type="button"
                      className="management-secondary-button"
                      onClick={() =>
                        navigate(
                          `/admin/results`
                        )
                      }
                    >
                      Results
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* ================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ================================================= */}

      {deleteElectionTarget && (
        <div className="delete-modal-overlay">

          <div className="delete-modal glass-elections">

            {/* CLOSE */}

            <button
              type="button"
              className="delete-modal-close"
              onClick={() =>
                !deleting &&
                setDeleteElectionTarget(null)
              }
              disabled={deleting}
            >
              ×
            </button>

            {/* WARNING ICON */}

            <div className="delete-modal-icon">
              !
            </div>

            {/* CONTENT */}

            <div className="delete-modal-content">

              <p className="delete-modal-eyebrow">
                ELECTION MANAGEMENT
              </p>

              <h3>
                Delete Election?
              </h3>

              <p>
                Are you sure you want to
                delete{" "}
                <strong>
                  "{deleteElectionTarget.title}"
                </strong>
                ?
              </p>

              <span className="delete-modal-warning">
                This action cannot be undone.
              </span>

            </div>

            {/* ERROR */}

            {deleteMessage && (
              <div className="delete-modal-error">
                {deleteMessage}
              </div>
            )}

            {/* ACTIONS */}

            <div className="delete-modal-actions">

              <button
                type="button"
                className="delete-modal-cancel"
                onClick={() =>
                  setDeleteElectionTarget(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-modal-confirm"
                onClick={
                  confirmDeleteElection
                }
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Election"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}