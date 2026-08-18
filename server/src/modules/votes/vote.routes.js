import express from "express";

import studentAuth from "../../middleware/studentAuth.js";
import adminAuth from "../../middleware/adminAuth.js";

import {
  castVote,
  getAdminResultElections,
  getElectionResults,
} from "./vote.controller.js";

const router =
  express.Router();


// =====================================================
// CAST VOTE
// STUDENT ONLY
// =====================================================

router.post(
  "/",
  studentAuth,
  castVote
);


// =====================================================
// GET ELECTIONS FOR ADMIN RESULTS
// ADMIN ONLY
// =====================================================

router.get(
  "/results/elections",
  adminAuth,
  getAdminResultElections
);


// =====================================================
// GET LIVE RESULTS
// ADMIN ONLY
// =====================================================

router.get(
  "/results/:electionId",
  adminAuth,
  getElectionResults
);


export default router;