import fs from "fs";
import csv from "csv-parser";

import Election from "./election.model.js";
import Student from "../students/student.model.js";

export const createElection = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      candidates: candidatesData,
    } = req.body;

    // ================= VALIDATION =================

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, start date and end date are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start or end date.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message:
          "End date must be after start date.",
      });
    }

    // ================= CSV CHECK =================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Eligible voters CSV file is required.",
      });
    }

    // ================= READ CSV =================

    const voters = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(
          csv({
            mapHeaders: ({ header }) =>
              header
                ?.replace(/^\uFEFF/, "")
                .trim()
                .toLowerCase()
                .replace(/[\s_-]+/g, ""),
          })
        )
        .on("data", (row) => {
          voters.push({
            studentId:
              row.studentid?.trim(),

            name: (
              row.fullname ||
              row.name
            )?.trim(),

            instituteEmail: (
              row.instituteemailid ||
              row.instituteemail
            )
              ?.trim()
              .toLowerCase(),

            department:
              row.department?.trim(),

            year:
              row.year?.trim(),

            division:
              row.division?.trim(),
          });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // ================= CSV EMPTY =================

    if (voters.length === 0) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "The eligible voters CSV is empty.",
      });
    }

    // ================= VALIDATE STUDENT IDs =================

    const invalidIdRows = voters.filter(
      (voter) =>
        !voter.studentId
    );

    if (invalidIdRows.length > 0) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "Some CSV rows do not contain a valid Student ID.",
      });
    }

    // ================= DUPLICATE STUDENT IDs =================

    const studentIds = voters.map(
      (voter) =>
        voter.studentId
    );

    const duplicateIds = [
      ...new Set(
        studentIds.filter(
          (id, index) =>
            studentIds.indexOf(id) !==
            index
        )
      ),
    ];

    if (duplicateIds.length > 0) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "Duplicate Student IDs found in CSV.",
        duplicates:
          duplicateIds,
      });
    }

    // ================= REQUIRED CSV FIELDS =================

    const invalidRows = voters.filter(
      (voter) =>
        !voter.studentId ||
        !voter.name ||
        !voter.instituteEmail ||
        !voter.year ||
        !voter.department ||
        !voter.division
    );

    if (invalidRows.length > 0) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "Some CSV rows are missing required fields.",
      });
    }

    // ================= VERIFY STUDENTS =================

    const registeredStudents =
      await Student.find({
        studentId: {
          $in: studentIds,
        },
      }).select(
        "studentId fullName instituteEmail year department division"
      );

    const registeredIds =
      registeredStudents.map(
        (student) =>
          student.studentId
      );

    const unregisteredStudents =
      studentIds.filter(
        (id) =>
          !registeredIds.includes(id)
      );

    if (
      unregisteredStudents.length > 0
    ) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "Some students in the CSV are not registered in VoteChain.",
        studentIds:
          unregisteredStudents,
      });
    }

    // =================================================
    // CANDIDATES
    // =================================================

    let candidateIds = [];

    if (candidatesData) {
      try {
        const parsedCandidates =
          typeof candidatesData ===
          "string"
            ? JSON.parse(
                candidatesData
              )
            : candidatesData;

        if (
          !Array.isArray(
            parsedCandidates
          )
        ) {
          throw new Error(
            "Candidates must be an array."
          );
        }

        candidateIds =
          parsedCandidates.map(
            (candidate) =>
              typeof candidate ===
              "string"
                ? candidate.trim()
                : candidate.studentId?.trim()
          ).filter(Boolean);

      } catch (error) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          success: false,
          message:
            "Invalid candidates data.",
        });
      }
    }

    // =================================================
    // REQUIRE AT LEAST ONE CANDIDATE
    // =================================================

    if (candidateIds.length === 0) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "At least one candidate is required.",
      });
    }

    // =================================================
    // DUPLICATE CANDIDATES
    // =================================================

    const duplicateCandidateIds = [
      ...new Set(
        candidateIds.filter(
          (id, index) =>
            candidateIds.indexOf(id) !==
            index
        )
      ),
    ];

    if (
      duplicateCandidateIds.length > 0
    ) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "Duplicate candidates selected.",
        duplicates:
          duplicateCandidateIds,
      });
    }

    // =================================================
    // VERIFY CANDIDATES ARE ELIGIBLE VOTERS
    // =================================================

    const invalidCandidates =
      candidateIds.filter(
        (candidateId) =>
          !studentIds.includes(
            candidateId
          )
      );

    if (
      invalidCandidates.length > 0
    ) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message:
          "Every candidate must be an eligible voter for this election.",
        studentIds:
          invalidCandidates,
      });
    }

    // =================================================
    // BUILD CANDIDATE OBJECTS
    // =================================================
    // IMPORTANT:
    // Candidate information is taken from the
    // eligible voter record instead of trusting
    // manually entered candidate details.

    const candidates =
      candidateIds.map(
        (candidateId) => {
          const voter =
            voters.find(
              (voter) =>
                voter.studentId ===
                candidateId
            );

          return {
            studentId:
              voter.studentId,

            name:
              voter.name,

            instituteEmail:
              voter.instituteEmail,

            year:
              voter.year,

            department:
              voter.department,

            division:
              voter.division,

            position: "",
          };
        }
      );

    // ================= CREATE ELECTION =================

    let status = "upcoming";

    const now = new Date();

    if (
      now >= start &&
      now < end
    ) {
      status = "active";
    }

    if (now >= end) {
      status = "completed";
    }

    const election =
      await Election.create({
        title:
          title.trim(),

        description:
          description.trim(),

        startDate:
          start,

        endDate:
          end,

        status,

        eligibleVoters:
          voters,

        candidates:
          candidates,

        createdBy:
          req.admin._id,
      });

    // ================= DELETE CSV =================

    fs.unlinkSync(
      req.file.path
    );

    // ================= SUCCESS =================

    return res.status(201).json({
      success: true,

      message:
        "Election created successfully.",

      election,
    });

  } catch (error) {
    console.error(
      "Create Election Error:",
      error
    );

    // Delete uploaded file if something fails

    if (req.file?.path) {
      try {
        fs.unlinkSync(
          req.file.path
        );
      } catch {}
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to create election.",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET ALL ELECTIONS FOR ADMIN
// =====================================================

export const getAdminElections = async (
  req,
  res
) => {
  try {
    // =================================================
    // FETCH ALL ELECTIONS
    // =================================================

    const elections =
      await Election.find({})
        .sort({
          startDate: -1,
        });

    // =================================================
    // UPDATE STATUS BASED ON CURRENT TIME
    // =================================================

    const now =
      new Date();

    const updatedElections =
      elections.map(
        (election) => {

          let currentStatus =
            election.status;

          if (
            now >= election.startDate &&
            now < election.endDate
          ) {
            currentStatus =
              "active";

          } else if (
            now < election.startDate
          ) {
            currentStatus =
              "upcoming";

          } else if (
            now >= election.endDate
          ) {
            currentStatus =
              "completed";
          }

          return {
            id:
              election._id,

            title:
              election.title,

            description:
              election.description,

            startDate:
              election.startDate,

            endDate:
              election.endDate,

            status:
              currentStatus,

            eligibleVoters:
              election
                .eligibleVoters
                ?.length || 0,

            candidates:
              election
                .candidates
                ?.length || 0,

            createdAt:
              election.createdAt,
          };
        }
      );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      elections:
        updatedElections,
    });

  } catch (error) {

    console.error(
      "Get Admin Elections Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch elections.",
    });
  }
};
// =====================================================
// GET SINGLE ELECTION DETAILS
// ADMIN ONLY
// =====================================================

export const getElectionById = async (
  req,
  res
) => {
  try {
    // =================================================
    // GET ELECTION ID
    // =================================================

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Election ID is required.",
      });
    }

    // =================================================
    // FIND ELECTION
    // =================================================

    const election =
      await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message:
          "Election not found.",
      });
    }

    // =================================================
    // UPDATE STATUS BASED ON CURRENT TIME
    // =================================================

    const now = new Date();

    let currentStatus =
      election.status;

    if (
      now >= election.startDate &&
      now < election.endDate
    ) {
      currentStatus =
        "active";

    } else if (
      now < election.startDate
    ) {
      currentStatus =
        "upcoming";

    } else if (
      now >= election.endDate
    ) {
      currentStatus =
        "completed";
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      election: {
        id: election._id,

        title:
          election.title,

        description:
          election.description,

        startDate:
          election.startDate,

        endDate:
          election.endDate,

        status:
          currentStatus,

        eligibleVoters:
          election.eligibleVoters || [],

        candidates:
          election.candidates || [],

        createdBy:
          election.createdBy,

        createdAt:
          election.createdAt,

        updatedAt:
          election.updatedAt,
      },
    });

  } catch (error) {

    console.error(
      "Get Election Details Error:",
      error
    );

    // =================================================
    // INVALID MONGODB ID
    // =================================================

    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid election ID.",
      });
    }

    // =================================================
    // SERVER ERROR
    // =================================================

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch election details.",
    });
  }
};

// =====================================================
// UPDATE UPCOMING ELECTION
// ADMIN ONLY
// =====================================================

export const updateElection = async (
  req,
  res
) => {
  try {
    // =================================================
    // GET ELECTION ID
    // =================================================

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Election ID is required.",
      });
    }

    // =================================================
    // FIND ELECTION
    // =================================================

    const election =
      await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message:
          "Election not found.",
      });
    }

    // =================================================
    // CHECK CURRENT STATUS
    // =================================================

    const now = new Date();

    let currentStatus =
      election.status;

    if (
      now >= election.startDate &&
      now < election.endDate
    ) {
      currentStatus = "active";

    } else if (
      now < election.startDate
    ) {
      currentStatus = "upcoming";

    } else if (
      now >= election.endDate
    ) {
      currentStatus = "completed";
    }

    // =================================================
    // ONLY UPCOMING ELECTIONS CAN BE EDITED
    // =================================================

    if (
      currentStatus !== "upcoming"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only upcoming elections can be edited.",
      });
    }

    // =================================================
    // GET REQUEST DATA
    // =================================================

    const {
      title,
      description,
      startDate,
      endDate,
      candidates: candidatesData,
    } = req.body;

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (
      !title ||
      !description ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, start date and end date are required.",
      });
    }

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start or end date.",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message:
          "End date must be after start date.",
      });
    }

    // =================================================
    // NEW START DATE MUST STILL BE IN FUTURE
    // =================================================

    if (start <= now) {
      return res.status(400).json({
        success: false,
        message:
          "Start date must be in the future for an upcoming election.",
      });
    }

    // =================================================
    // CANDIDATES
    // =================================================

    let candidateIds = [];

    if (candidatesData) {
      try {
        const parsedCandidates =
          typeof candidatesData ===
          "string"
            ? JSON.parse(
                candidatesData
              )
            : candidatesData;

        if (
          !Array.isArray(
            parsedCandidates
          )
        ) {
          throw new Error(
            "Candidates must be an array."
          );
        }

        candidateIds =
          parsedCandidates
            .map(
              (candidate) =>
                typeof candidate ===
                "string"
                  ? candidate.trim()
                  : candidate.studentId?.trim()
            )
            .filter(Boolean);

      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid candidates data.",
        });
      }
    }

    // =================================================
    // REQUIRE AT LEAST ONE CANDIDATE
    // =================================================

    if (
      candidateIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one candidate is required.",
      });
    }

    // =================================================
    // DUPLICATE CANDIDATES
    // =================================================

    const duplicateCandidateIds = [
      ...new Set(
        candidateIds.filter(
          (id, index) =>
            candidateIds.indexOf(
              id
            ) !== index
        )
      ),
    ];

    if (
      duplicateCandidateIds.length >
      0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate candidates selected.",
        duplicates:
          duplicateCandidateIds,
      });
    }

    // =================================================
    // GET EXISTING ELIGIBLE VOTERS
    // =================================================

    const eligibleVoters =
      election.eligibleVoters || [];

    const eligibleStudentIds =
      eligibleVoters.map(
        (voter) =>
          voter.studentId
      );

    // =================================================
    // VERIFY CANDIDATES ARE ELIGIBLE
    // =================================================

    const invalidCandidates =
      candidateIds.filter(
        (candidateId) =>
          !eligibleStudentIds.includes(
            candidateId
          )
      );

    if (
      invalidCandidates.length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Every candidate must be an eligible voter for this election.",
        studentIds:
          invalidCandidates,
      });
    }

    // =================================================
    // BUILD CANDIDATE OBJECTS
    // =================================================

    const candidates =
      candidateIds.map(
        (candidateId) => {

          const voter =
            eligibleVoters.find(
              (voter) =>
                voter.studentId ===
                candidateId
            );

          return {
            studentId:
              voter.studentId,

            name:
              voter.name,

            instituteEmail:
              voter.instituteEmail,

            year:
              voter.year,

            department:
              voter.department,

            division:
              voter.division,

          };
        }
      );

    // =================================================
    // UPDATE ELECTION
    // =================================================

    election.title =
      title.trim();

    election.description =
      description.trim();

    election.startDate =
      start;

    election.endDate =
      end;

    election.status =
      "upcoming";

    election.candidates =
      candidates;

    await election.save();

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Election updated successfully.",

      election,
    });

  } catch (error) {

    console.error(
      "Update Election Error:",
      error
    );

    // =================================================
    // INVALID MONGODB ID
    // =================================================

    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid election ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update election.",
    });
  }
};

// =====================================================
// DELETE UPCOMING ELECTION
// ADMIN ONLY
// =====================================================

export const deleteElection = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Election ID is required.",
      });
    }

    // =================================================
    // FIND ELECTION
    // =================================================

    const election =
      await Election.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message:
          "Election not found.",
      });
    }

    // =================================================
    // CHECK CURRENT STATUS
    // =================================================

    const now = new Date();

    let currentStatus =
      election.status;

    if (
      now >= election.startDate &&
      now < election.endDate
    ) {
      currentStatus = "active";
    } else if (
      now < election.startDate
    ) {
      currentStatus = "upcoming";
    } else if (
      now >= election.endDate
    ) {
      currentStatus = "completed";
    }

    // =================================================
    // ONLY UPCOMING ELECTIONS CAN BE DELETED
    // =================================================

    if (
      currentStatus !== "upcoming"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only upcoming elections can be deleted.",
      });
    }

    // =================================================
    // DELETE ELECTION
    // =================================================

    await Election.findByIdAndDelete(id);

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Election deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Election Error:",
      error
    );

    // =================================================
    // INVALID MONGODB ID
    // =================================================

    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid election ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete election.",
    });
  }
};