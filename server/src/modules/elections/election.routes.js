import express from "express";
import multer from "multer";

import {
  createElection,
  getAdminElections,
  getElectionById,
  updateElection,
  deleteElection,
} from "./election.controller.js";

import adminAuth from "../../middleware/adminAuth.js";

const router = express.Router();

// =====================================================
// MULTER - ELIGIBLE VOTERS CSV
// =====================================================

const upload = multer({
  dest: "uploads/elections/",

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    if (
      file.mimetype ===
        "text/csv" ||
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
// GET ALL ELECTIONS
// ADMIN ONLY
// =====================================================

router.get(
  "/",
  adminAuth,
  getAdminElections
);

router.get(
  "/:id",
  adminAuth,
  getElectionById
);

router.put(
  "/:id",
  adminAuth,
  updateElection
);

router.delete(
  "/:id",
  adminAuth,
  deleteElection
);

router.post(
  "/",
  adminAuth,
  upload.single(
    "eligibleVotersCsv"
  ),
  createElection
);

export default router;