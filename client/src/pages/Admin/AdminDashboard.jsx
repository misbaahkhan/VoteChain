import { useNavigate } from "react-router-dom";
import "../../styles/admin-dashboard.css";


export default function AdminDashboard() {
  const navigate = useNavigate();


  const adminData =
    sessionStorage.getItem("votechain_admin") ||
    localStorage.getItem("votechain_admin");


  const admin = adminData
    ? JSON.parse(adminData)
    : null;


  const handleLogout = () => {
    sessionStorage.removeItem("votechain_token");
    sessionStorage.removeItem("votechain_admin");


    localStorage.removeItem("votechain_token");
    localStorage.removeItem("votechain_admin");


    navigate("/");
  };


  return (
    <main className="admin-dashboard">


      <div className="admin-dashboard-bg" />


      {/* ================= NAVBAR ================= */}


      <header className="admin-navbar glass-admin">


        <div className="admin-brand">


          <div className="admin-logo">
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


        <div className="admin-nav-right">


          <div className="admin-status">
            <span />
            Administrator
          </div>


          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            Logout
          </button>


        </div>


      </header>


      {/* ================= CONTENT ================= */}


      <section className="admin-content">


        {/* ================= WELCOME ================= */}


        <div className="admin-welcome">


          <p className="admin-eyebrow">
            ADMINISTRATOR DASHBOARD
          </p>


          <h2>
            Welcome,
            <span>
              {" "}
              {admin?.fullName || "Admin"}
            </span>
          </h2>


          <p>
            Manage elections, candidates and voting
            activity from one secure platform.
          </p>


        </div>


        {/* ================= QUICK ACTIONS ================= */}


        <div className="admin-section-title">


          <h3>
            Election Management
          </h3>


          <p>
            Create and manage your digital elections.
          </p>


        </div>


        <div className="admin-action-grid">


          {/* CREATE ELECTION */}


          <button
            type="button"
            className="admin-action-card glass-admin"
            onClick={() =>
              navigate("/admin/elections/create")
            }
          >


            <div className="admin-action-icon">
              +
            </div>


            <div className="admin-action-text">


              <h3>
                Create Election
              </h3>


              <p>
                Start a new election and configure
                its voting period.
              </p>


            </div>


            <span className="admin-arrow">
              →
            </span>


          </button>


          {/* MANAGE ELECTIONS */}


          <button
            type="button"
            className="admin-action-card glass-admin"
            onClick={() =>
              navigate("/admin/elections")
            }
          >


            <div className="admin-action-icon">
              ◈
            </div>


            <div className="admin-action-text">


              <h3>
                Manage Elections
              </h3>


              <p>
                View active, upcoming and completed
                elections.
              </p>


            </div>


            <span className="admin-arrow">
              →
            </span>


          </button>


          {/* RESULTS */}


          <button
            type="button"
            className="admin-action-card glass-admin"
            onClick={() =>
              navigate("/admin/results")
            }
          >


            <div className="admin-action-icon">
              ↗
            </div>


            <div className="admin-action-text">


              <h3>
                Election Results
              </h3>


              <p>
                Monitor votes and view election
                results.
              </p>


            </div>


            <span className="admin-arrow">
              →
            </span>


          </button>


          {/* ================= IMPORT STUDENTS ================= */}


          <button
            type="button"
            className="admin-action-card glass-admin"
            onClick={() =>
              navigate("/admin/students/import")
            }
          >


            <div className="admin-action-icon">
              ↑
            </div>


            <div className="admin-action-text">


              <h3>
                Import Students
              </h3>


              <p>
                Register students by uploading
                the master student CSV.
              </p>


            </div>


            <span className="admin-arrow">
              →
            </span>


          </button>


          {/* ================= ADD NEW ADMIN ================= */}

{admin?.role === "superAdmin" && (

  <button
    type="button"
    className="admin-action-card glass-admin"
    onClick={() =>
      navigate("/admin/add-admin")
    }
  >

    <div className="admin-action-icon">
      ♙
    </div>

    <div className="admin-action-text">

      <h3>
        Add New Admin
      </h3>

      <p>
        Create a new administrator account
        for the VoteChain platform.
      </p>

    </div>

    <span className="admin-arrow">
      →
    </span>

  </button>

)}
        </div>


      </section>


    </main>
  );
}