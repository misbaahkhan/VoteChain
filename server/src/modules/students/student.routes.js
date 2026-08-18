import express from "express";
import multer from "multer";

import adminAuth from "../../middleware/adminAuth.js";
import studentAuth from "../../middleware/studentAuth.js";

import {
  loginStudent,
  importStudents,
  getStudentElections,
  getStudentElection,
  forgotPassword,
  verifyOtp,
  resetPasswordController,
  getStudentElectionResults,
} from "./student.controller.js";

const router = express.Router();


// =====================================================
// MULTER - STUDENT CSV UPLOAD
// =====================================================

const upload = multer({
  dest: "uploads/students/",

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.originalname
        .toLowerCase()
        .endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only CSV files are allowed."
        )
      );
    }
  },
});


// =====================================================
// STUDENT LOGIN
// =====================================================

router.post(
  "/login",
  loginStudent
);


// =====================================================
// IMPORT STUDENTS FROM MULTIPLE CSVs
// ADMIN ONLY
// =====================================================

router.post(
  "/import",
  adminAuth,
  upload.array(
    "studentsCsv",
    10
  ),
  importStudents
);


// =====================================================
// GET AVAILABLE ELECTIONS
// STUDENT ONLY
// =====================================================

router.get(
  "/elections",
  studentAuth,
  getStudentElections
);


// =====================================================
// GET SPECIFIC ELECTION FOR VOTING
// STUDENT ONLY
// =====================================================

router.get(
  "/elections/:electionId",
  studentAuth,
  getStudentElection
);


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
  "/forgot-password",
  forgotPassword
);


// =====================================================
// VERIFY OTP
// =====================================================

router.post(
  "/verify-otp",
  verifyOtp
);


// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
  "/reset-password",
  resetPasswordController
);


// =====================================================
// GET ELECTION RESULTS
// STUDENT ONLY - ELIGIBLE VOTERS
// AVAILABLE ONLY AFTER ELECTION COMPLETES
// =====================================================

router.get(
  "/elections/:electionId/results",
  studentAuth,
  getStudentElectionResults
);


export default router;