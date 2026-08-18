import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import "../../styles/import-students.css";

export default function ImportStudents() {
  const navigate = useNavigate();

  const [csvFiles, setCsvFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    setError("");
    setSuccess("");

    if (files.length === 0) {
      setCsvFiles([]);
      return;
    }

    // =================================================
    // MAXIMUM 10 CSV FILES
    // =================================================

    if (files.length > 10) {
      setError(
        "You can upload a maximum of 10 CSV files at once."
      );

      setCsvFiles([]);
      e.target.value = "";
      return;
    }

    // =================================================
    // CHECK ALL FILES ARE CSV
    // =================================================

    const invalidFile =
      files.find(
        (file) =>
          !file.name
            .toLowerCase()
            .endsWith(".csv")
      );

    if (invalidFile) {
      setError(
        `"${invalidFile.name}" is not a CSV file. Please upload CSV files only.`
      );

      setCsvFiles([]);
      e.target.value = "";
      return;
    }

    // =================================================
    // STORE ALL CSV FILES
    // =================================================

    setCsvFiles(files);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =================================================
    // CHECK FILES
    // =================================================

    if (csvFiles.length === 0) {
      setError(
        "Please select at least one student CSV file."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "votechain_token"
        ) ||
        sessionStorage.getItem(
          "votechain_token"
        );

      if (!token) {
        setError(
          "Admin authentication expired. Please login again."
        );

        navigate("/admin-login");
        return;
      }

      // =================================================
      // CREATE FORM DATA
      // =================================================

      const formData =
        new FormData();

      // =================================================
      // APPEND EVERY CSV FILE
      // USING SAME FIELD NAME
      // =================================================

      csvFiles.forEach(
        (file) => {
          formData.append(
            "studentsCsv",
            file
          );
        }
      );

      // =================================================
      // SEND REQUEST
      // =================================================

      const response =
        await fetch(
          "http://localhost:5000/api/students/import",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formData,
          }
        );

      const data =
        await response.json();

      // =================================================
      // HANDLE ERROR
      // =================================================

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to import students."
        );

        return;
      }

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        data.message ||
          "Students imported successfully."
      );

      setCsvFiles([]);

      // =================================================
      // CLEAR FILE INPUT
      // =================================================

      const fileInput =
        document.getElementById(
          "studentCsv"
        );

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {

      console.error(
        "Import Students Error:",
        error
      );

      setError(
        "Unable to connect to VoteChain server."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <main className="import-students-page">

      <div className="import-students-bg" />

      {/* ================= NAVBAR ================= */}

      <header className="import-navbar glass-import">

        <div className="import-brand">

          <div className="import-logo">

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
              "/admin/dashboard"
            )
          }
        >

          <ArrowLeft size={16} />

          Dashboard

        </button>

      </header>


      {/* ================= CONTENT ================= */}

      <section className="import-content">

        <div className="import-heading">

          <p className="import-eyebrow">
            STUDENT MANAGEMENT
          </p>

          <h2>
            Import Students
          </h2>

          <p>
            Register students in VoteChain by
            uploading one or more student CSV
            files.
          </p>

        </div>


        {/* ================= CARD ================= */}

        <form
          className="import-card glass-import"
          onSubmit={handleSubmit}
        >

          <div className="import-section-heading">

            <div>

              <h3>
                Student Database
              </h3>

              <p>
                Upload one or more CSV files
                containing students who can
                participate in VoteChain.
              </p>

            </div>

            <span>
              01
            </span>

          </div>


          {/* ================= UPLOAD ================= */}

          <input
            id="studentCsv"
            type="file"
            accept=".csv,text/csv"
            multiple
            hidden
            onChange={handleFileChange}
          />


          <label
            htmlFor="studentCsv"
            className="student-dropzone"
          >

            <div className="student-upload-icon">

              {csvFiles.length > 0 ? (
                <CheckCircle size={25} />
              ) : (
                <Upload size={25} />
              )}

            </div>


            {csvFiles.length > 0 ? (

              <>

                <strong>
                  {csvFiles.length} CSV file
                  {csvFiles.length > 1
                    ? "s"
                    : ""}{" "}
                  selected
                </strong>

                <span>
                  Click here to change
                  selected files
                </span>

              </>

            ) : (

              <>

                <strong>
                  Upload Student CSV Files
                </strong>

                <span>
                  Click here to browse and
                  select multiple CSV files
                </span>

              </>

            )}

          </label>


          {/* ================= SELECTED FILES ================= */}

          {csvFiles.length > 0 && (

            <div
              className="selected-student-files"
              style={{
                marginTop: "15px",
              }}
            >

              {csvFiles.map(
                (file, index) => (

                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      marginBottom: "6px",
                      borderRadius: "7px",
                      background:
                        "rgba(255,255,255,0.06)",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                    }}
                  >

                    <FileText
                      size={15}
                    />

                    <span
                      style={{
                        fontSize: "12px",
                        color:
                          "rgba(255,255,255,0.75)",
                      }}
                    >
                      {file.name}
                    </span>

                  </div>

                )
              )}

            </div>

          )}


          {/* ================= FORMAT ================= */}

          <div className="student-format">

            <FileText size={16} />

            <div>

              <strong>
                Required CSV columns
              </strong>

              <code>
                Student ID, Full Name,
                InstituteEmailID, Department,
                Year, Division
              </code>

            </div>

          </div>


          {/* ================= PASSWORD INFO ================= */}

          <div className="initial-password-info">

            <div className="info-icon">
              🔐
            </div>

            <div>

              <strong>
                Initial Student Password
              </strong>

              <p>
                Each student will initially use
                their Student ID followed by
                <b> @Apsit</b>.
              </p>

              <code>
                Example: 23104124@Apsit
              </code>

            </div>

          </div>


          {/* ================= ERROR ================= */}

          {error && (

            <div className="import-error">
              {error}
            </div>

          )}


          {/* ================= SUCCESS ================= */}

          {success && (

            <div className="import-success">
              ✓ {success}
            </div>

          )}


          {/* ================= ACTIONS ================= */}

          <div className="import-actions">

            <button
              type="button"
              className="cancel-import"
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="import-button"
              disabled={loading}
            >

              {loading
                ? "Importing Students..."
                : "Import Students →"}

            </button>

          </div>

        </form>

      </section>

    </main>
  );
}