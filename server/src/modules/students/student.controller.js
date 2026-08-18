import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import csv from "csv-parser";

import Student from "./student.model.js";
import Election from "../elections/election.model.js";
import Vote from "../votes/vote.model.js";

import {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
} from "../../utils/passwordReset.service.js";


// =====================================================
// STUDENT LOGIN
// =====================================================

export const loginStudent = async (req, res) => {
  try {

    const {
      studentId,
      password,
    } = req.body;


    // Check required fields

    if (
      !studentId ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student ID and password are required",
      });
    }


    // Find student

    const student =
      await Student.findOne({
        studentId:
          studentId.trim(),
      });


    if (!student) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Student ID or password",
      });
    }


    // Check whether account is active

    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your student account is inactive",
      });
    }


    // Compare password using model method

    const isPasswordCorrect =
      await student.comparePassword(
        password
      );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Student ID or password",
      });
    }


    // Create JWT

    const token =
      jwt.sign(
        {
          id:
            student._id,

          studentId:
            student.studentId,

          role:
            "student",
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "1d",
        }
      );


    return res.status(200).json({

      success: true,

      message:
        "Student login successful",

      token,

      student: {

        id:
          student._id,

        studentId:
          student.studentId,

        fullName:
          student.fullName,

        instituteEmail:
          student.instituteEmail,

        department:
          student.department,

        year:
          student.year,

        division:
          student.division,

        className:
          student.className,

        firstLogin:
          student.firstLogin,

      },

    });

  } catch (error) {

    console.error(
      "Student Login Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};



// =====================================================
// IMPORT STUDENTS FROM MULTIPLE CSV FILES
// =====================================================

export const importStudents = async (
  req,
  res
) => {

  try {

    // =================================================
    // CHECK CSV FILES
    // =================================================

    if (
      !req.files ||
      req.files.length === 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "At least one student CSV file is required.",

      });

    }


    // =================================================
    // READ ALL CSV FILES
    // =================================================

    const students = [];


    for (
      const file of req.files
    ) {

      await new Promise(
        (resolve, reject) => {

          fs.createReadStream(
            file.path
          )

            .pipe(
              csv({

                mapHeaders:
                  ({ header }) => {

                    // Remove BOM
                    // Trim spaces
                    // Convert to lowercase
                    // Remove spaces, -, and _

                    return String(
                      header || ""
                    )
                      .replace(
                        /^\uFEFF/,
                        ""
                      )
                      .trim()
                      .toLowerCase()
                      .replace(
                        /[^a-z0-9]/g,
                        ""
                      );

                  },


                mapValues:
                  ({ value }) => {

                    return String(
                      value ?? ""
                    ).trim();

                  },

              })
            )


            .on(
              "data",
              (row) => {

                // =================================================
                // IGNORE COMPLETELY EMPTY ROWS
                // =================================================

                const hasAnyValue =
                  Object.values(row)
                    .some(
                      (value) =>
                        String(
                          value ?? ""
                        ).trim() !== ""
                    );


                if (!hasAnyValue) {
                  return;
                }


                // =================================================
                // READ STUDENT FIELDS
                // =================================================

                const studentId =
                  String(
                    row.studentid ??
                      row.student_id ??
                      row.id ??
                      ""
                  ).trim();


                const fullName =
                  String(
                    row.fullname ??
                      row.name ??
                      ""
                  ).trim();


                const instituteEmail =
                  String(
                    row.instituteemailid ??
                      row.instituteemail ??
                      row.email ??
                      ""
                  )
                    .trim()
                    .toLowerCase();


                const department =
                  String(
                    row.department ??
                      ""
                  ).trim();


                const year =
                  String(
                    row.year ??
                      ""
                  )
                    .trim()
                    .toUpperCase();


                const division =
                  String(
                    row.division ??
                      ""
                  )
                    .trim()
                    .toUpperCase();


                // =================================================
                // ADD STUDENT TO COMMON LIST
                // =================================================

                students.push({

                  studentId,

                  fullName,

                  instituteEmail,

                  department,

                  year,

                  division,

                });

              }
            )


            .on(
              "end",
              resolve
            )


            .on(
              "error",
              reject
            );

        }
      );

    }


    // =================================================
    // EMPTY CSV FILES
    // =================================================

    if (
      students.length === 0
    ) {

      req.files.forEach(
        (file) => {

          try {

            fs.unlinkSync(
              file.path
            );

          } catch {}

        }
      );


      return res.status(400).json({

        success: false,

        message:
          "The uploaded CSV files are empty.",

      });

    }


    // =================================================
    // VALIDATE REQUIRED FIELDS
    // =================================================

    const invalidRows = [];


    students.forEach(
      (
        student,
        index
      ) => {

        const missingFields = [];


        if (
          !student.studentId
        ) {

          missingFields.push(
            "Student ID"
          );

        }


        if (
          !student.fullName
        ) {

          missingFields.push(
            "Full Name"
          );

        }


        if (
          !student.instituteEmail
        ) {

          missingFields.push(
            "Institute Email ID"
          );

        }


        if (
          !student.department
        ) {

          missingFields.push(
            "Department"
          );

        }


        if (
          !student.year
        ) {

          missingFields.push(
            "Year"
          );

        }


        if (
          !student.division
        ) {

          missingFields.push(
            "Division"
          );

        }


        if (
          missingFields.length > 0
        ) {

          invalidRows.push({

            // Row number is based on
            // combined uploaded files

            rowNumber:
              index + 2,

            missingFields,

            student,

          });

        }

      }
    );


    // =================================================
    // INVALID ROWS
    // =================================================

    if (
      invalidRows.length > 0
    ) {

      req.files.forEach(
        (file) => {

          try {

            fs.unlinkSync(
              file.path
            );

          } catch {}

        }
      );


      console.error(
        "Invalid CSV rows:",
        JSON.stringify(
          invalidRows,
          null,
          2
        )
      );


      return res.status(400).json({

        success: false,

        message:
          "Some CSV rows are missing required fields.",

        invalidRows,

      });

    }


    // =================================================
    // CHECK DUPLICATE STUDENT IDs
    // ACROSS ALL CSV FILES
    // =================================================

    const studentIds =
      students.map(
        (student) =>
          student.studentId
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


    if (
      duplicateIds.length > 0
    ) {

      req.files.forEach(
        (file) => {

          try {

            fs.unlinkSync(
              file.path
            );

          } catch {}

        }
      );


      return res.status(400).json({

        success: false,

        message:
          "Duplicate Student IDs found across the uploaded CSV files.",

        duplicates:
          duplicateIds,

      });

    }


    // =================================================
    // CHECK DUPLICATE EMAILS
    // ACROSS ALL CSV FILES
    // =================================================

    const emails =
      students.map(
        (student) =>
          student.instituteEmail
      );


    const duplicateEmails = [

      ...new Set(

        emails.filter(
          (email, index) =>
            emails.indexOf(email) !==
            index
        )

      ),

    ];


    if (
      duplicateEmails.length > 0
    ) {

      req.files.forEach(
        (file) => {

          try {

            fs.unlinkSync(
              file.path
            );

          } catch {}

        }
      );


      return res.status(400).json({

        success: false,

        message:
          "Duplicate institute emails found across the uploaded CSV files.",

        duplicates:
          duplicateEmails,

      });

    }


    // =================================================
    // CHECK EXISTING STUDENTS IN DATABASE
    // =================================================

    const existingStudents =
      await Student.find({

        $or: [

          {
            studentId: {
              $in:
                studentIds,
            },
          },

          {
            instituteEmail: {
              $in:
                emails,
            },
          },

        ],

      }).select(
        "studentId instituteEmail"
      );


    if (
      existingStudents.length > 0
    ) {

      req.files.forEach(
        (file) => {

          try {

            fs.unlinkSync(
              file.path
            );

          } catch {}

        }
      );


      return res.status(400).json({

        success: false,

        message:
          "Some students are already registered in VoteChain.",

        existingStudents:
          existingStudents.map(
            (student) => ({

              studentId:
                student.studentId,

              instituteEmail:
                student.instituteEmail,

            })
          ),

      });

    }


    // =================================================
    // CREATE STUDENTS
    // =================================================

    const studentsToInsert = [];


    for (
      const student of students
    ) {

      // =================================================
      // INITIAL PASSWORD
      // StudentID@Apsit
      // =================================================

      const initialPassword =
        `${student.studentId}@Apsit`;


      // =================================================
      // HASH INITIAL PASSWORD
      // =================================================

      const hashedPassword =
        await bcrypt.hash(
          initialPassword,
          10
        );


      studentsToInsert.push({

        studentId:
          student.studentId,

        fullName:
          student.fullName,

        instituteEmail:
          student.instituteEmail,

        department:
          student.department,

        year:
          student.year,

        division:
          student.division,

        // CSV doesn't contain className,
        // so create it automatically.

        className:
          `${student.year} ${student.division}`,

        // Store only hashed password

        password:
          hashedPassword,

        // Student must change password
        // on first login.

        firstLogin:
          true,

        // Account active by default

        isActive:
          true,

      });

    }


    // =================================================
    // INSERT STUDENTS INTO MONGODB
    // =================================================

    const createdStudents =
      await Student.insertMany(
        studentsToInsert
      );


    // =================================================
    // DELETE ALL UPLOADED CSV FILES
    // =================================================

    req.files.forEach(
      (file) => {

        try {

          fs.unlinkSync(
            file.path
          );

        } catch {}

      }
    );


    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(201).json({

      success: true,

      message:
        `${createdStudents.length} students registered successfully from ${req.files.length} CSV file(s).`,

      totalFiles:
        req.files.length,

      totalRegistered:
        createdStudents.length,

    });


  } catch (error) {

    console.error(
      "Import Students Error:",
      error
    );


    // =================================================
    // DELETE ALL UPLOADED FILES IF ERROR OCCURS
    // =================================================

    if (
      req.files &&
      Array.isArray(req.files)
    ) {

      req.files.forEach(
        (file) => {

          if (
            file?.path
          ) {

            try {

              fs.unlinkSync(
                file.path
              );

            } catch {}

          }

        }
      );

    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to import students.",

      error:
        error.message,

    });

  }
};



// =====================================================
// GET ELECTIONS AVAILABLE FOR LOGGED-IN STUDENT
// =====================================================

export const getStudentElections =
  async (req, res) => {

    try {

      // =================================================
      // GET LOGGED-IN STUDENT
      // =================================================

      const studentId =
        req.student.studentId;


      // =================================================
      // FIND ELECTIONS WHERE STUDENT IS ELIGIBLE
      // =================================================

      const elections =
        await Election.find({

          "eligibleVoters.studentId":
            studentId,

        }).sort({

          startDate: 1,

        });


      // =================================================
      // FIND ELECTIONS WHERE STUDENT ALREADY VOTED
      // =================================================

      const votedElections =
        await Vote.find({

          studentId,

        }).select(
          "electionId"
        );


      // =================================================
      // CREATE SET OF VOTED ELECTION IDS
      // =================================================

      const votedElectionIds =
        new Set(

          votedElections.map(
            (vote) =>
              vote.electionId.toString()
          )

        );


      // =================================================
      // CURRENT TIME
      // =================================================

      const currentTime =
        new Date();


      // =================================================
      // PREPARE ELECTION DATA
      // =================================================

      const availableElections =
        elections.map(
          (election) => {

            let currentStatus =
              election.status;


            // =================================================
            // DETERMINE ACTUAL STATUS
            // =================================================

            if (
              currentTime >=
                election.startDate &&
              currentTime <
                election.endDate
            ) {

              currentStatus =
                "active";

            } else if (
              currentTime <
              election.startDate
            ) {

              currentStatus =
                "upcoming";

            } else if (
              currentTime >=
              election.endDate
            ) {

              currentStatus =
                "completed";

            }


            // =================================================
            // CHECK WHETHER STUDENT HAS VOTED
            // =================================================

            const hasVoted =
              votedElectionIds.has(
                election._id.toString()
              );


            // =================================================
            // RETURN ELECTION
            // =================================================

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

              hasVoted,

            };

          }
        );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        elections:
          availableElections,

      });


    } catch (error) {

      console.error(
        "Get Student Elections Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch available elections.",

      });

    }

  };



// =====================================================
// GET SPECIFIC ELECTION FOR VOTING
// STUDENT ONLY
// =====================================================

export const getStudentElection =
  async (
    req,
    res
  ) => {

    try {

      // =================================================
      // GET LOGGED-IN STUDENT
      // =================================================

      const studentId =
        req.student.studentId;


      // =================================================
      // GET ELECTION ID
      // =================================================

      const {
        electionId,
      } = req.params;


      if (!electionId) {

        return res.status(400).json({

          success: false,

          message:
            "Election ID is required.",

        });

      }


      // =================================================
      // FIND ELECTION
      // Student must be present inside
      // this election's eligibleVoters list.
      // =================================================

      const election =
        await Election.findOne({

          _id:
            electionId,

          "eligibleVoters.studentId":
            studentId,

        });


      // =================================================
      // ELECTION NOT FOUND / NOT ELIGIBLE
      // =================================================

      if (!election) {

        return res.status(404).json({

          success: false,

          message:
            "Election not found or you are not eligible to vote in this election.",

        });

      }


      // =================================================
      // DETERMINE CURRENT STATUS
      // =================================================

      const currentTime =
        new Date();


      let currentStatus =
        election.status;


      if (
        currentTime >=
          election.startDate &&
        currentTime <
          election.endDate
      ) {

        currentStatus =
          "active";

      } else if (
        currentTime <
        election.startDate
      ) {

        currentStatus =
          "upcoming";

      } else if (
        currentTime >=
        election.endDate
      ) {

        currentStatus =
          "completed";

      }


      // =================================================
      // RETURN ELECTION + CANDIDATES
      // =================================================

      return res.status(200).json({

        success: true,

        election: {

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

          candidates:
            election.candidates || [],

        },

      });


    } catch (error) {

      console.error(
        "Get Student Election Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch election details.",

      });

    }

  };



// =====================================================
// STUDENT FORGOT PASSWORD
// =====================================================

export const forgotPassword =
  async (
    req,
    res
  ) => {

    try {

      const {
        email,
      } = req.body;


      if (!email) {

        return res.status(400).json({

          success: false,

          message:
            "Email is required.",

        });

      }


      const result =
        await requestPasswordReset(
          "student",
          email
        );


      return res.status(200).json({

        success: true,

        ...result,

      });


    } catch (error) {

      console.error(
        "Student Forgot Password Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to process password reset.",

      });

    }

  };



// =====================================================
// STUDENT VERIFY OTP
// =====================================================

export const verifyOtp =
  async (
    req,
    res
  ) => {

    try {

      const {
        email,
        otp,
      } = req.body;


      if (
        !email ||
        !otp
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Email and OTP are required.",

        });

      }


      const result =
        await verifyPasswordResetOtp(
          "student",
          email,
          otp
        );


      return res.status(200).json({

        success: true,

        ...result,

      });


    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "OTP verification failed.",

      });

    }

  };



// =====================================================
// STUDENT RESET PASSWORD
// =====================================================

export const resetPasswordController =
  async (
    req,
    res
  ) => {

    try {

      const {
        email,
        newPassword,
      } = req.body;


      if (
        !email ||
        !newPassword
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Email and new password are required.",

        });

      }


      const result =
        await resetPassword(
          "student",
          email,
          newPassword
        );


      return res.status(200).json({

        success: true,

        ...result,

      });


    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Unable to reset password.",

      });

    }

  };



// =====================================================
// GET ELECTION RESULTS
// STUDENT ONLY
// ONLY ELIGIBLE VOTERS
// ONLY AFTER ELECTION COMPLETES
// =====================================================

export const getStudentElectionResults =
  async (
    req,
    res
  ) => {

    try {

      // =================================================
      // GET LOGGED-IN STUDENT
      // =================================================

      const studentId =
        req.student.studentId;


      // =================================================
      // GET ELECTION ID
      // =================================================

      const {
        electionId,
      } = req.params;


      if (!electionId) {

        return res.status(400).json({

          success: false,

          message:
            "Election ID is required.",

        });

      }


      // =================================================
      // FIND ELECTION
      // STUDENT MUST BE ELIGIBLE
      // =================================================

      const election =
        await Election.findOne({

          _id:
            electionId,

          "eligibleVoters.studentId":
            studentId,

        });


      // =================================================
      // NOT FOUND / NOT ELIGIBLE
      // =================================================

      if (!election) {

        return res.status(404).json({

          success: false,

          message:
            "Election not found or you are not eligible to view its results.",

        });

      }


      // =================================================
      // CHECK ELECTION STATUS USING END DATE
      // =================================================

      const currentTime =
        new Date();


      let currentStatus =
        election.status;


      if (
        currentTime >=
          election.startDate &&
        currentTime <
          election.endDate
      ) {

        currentStatus =
          "active";

      } else if (
        currentTime <
        election.startDate
      ) {

        currentStatus =
          "upcoming";

      } else if (
        currentTime >=
        election.endDate
      ) {

        currentStatus =
          "completed";

      }


      // =================================================
      // RESULTS NOT AVAILABLE BEFORE COMPLETION
      // =================================================

      if (
        currentStatus !==
        "completed"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Election results will be available after the election is completed.",

        });

      }


      // =================================================
      // GET VOTE COUNTS
      // =================================================

      const voteCounts =
        await Vote.aggregate([

          {

            $match: {

              electionId:
                election._id,

            },

          },

          {

            $group: {

              _id:
                "$candidateStudentId",

              candidateName: {

                $first:
                  "$candidateName",

              },

              voteCount: {

                $sum: 1,

              },

            },

          },

        ]);


      // =================================================
      // CREATE MAP OF VOTE COUNTS
      // =================================================

      const voteCountMap =
        new Map();


      voteCounts.forEach(
        (candidate) => {

          voteCountMap.set(

            candidate._id,

            {

              candidateName:
                candidate.candidateName,

              voteCount:
                candidate.voteCount,

            }

          );

        }
      );


      // =================================================
      // INCLUDE ALL CANDIDATES
      // INCLUDING 0 VOTES
      // =================================================

      const results =
        (
          election.candidates ||
          []
        )

          .map(
            (candidate) => {

              const candidateResult =
                voteCountMap.get(
                  candidate.studentId
                );


              return {

                studentId:
                  candidate.studentId,

                name:
                  candidate.name,

                position:
                  candidate.position ||
                  "",

                voteCount:
                  candidateResult
                    ? candidateResult.voteCount
                    : 0,

              };

            }
          )

          .sort(
            (a, b) =>
              b.voteCount -
              a.voteCount
          );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        election: {

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
            "completed",

        },

        results,

      });


    } catch (error) {

      console.error(
        "Get Student Election Results Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch election results.",

      });

    }

  };