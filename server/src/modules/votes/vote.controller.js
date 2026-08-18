import mongoose from "mongoose";
import Vote from "./vote.model.js";
import Election from "../elections/election.model.js";

import {
  createVoteIntegrityHash,
  verifyVoteIntegrityHash,
} from "../../utils/voteIntegrity.js";


// =====================================================
// CAST VOTE
// =====================================================

export const castVote = async (
  req,
  res
) => {
  try {

    // =================================================
    // GET STUDENT
    // =================================================

    const studentId =
      req.student.studentId;


    // =================================================
    // GET REQUEST DATA
    // =================================================

    const {
      electionId,
      candidateStudentId,
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (
      !electionId ||
      !candidateStudentId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Election and candidate are required.",
      });
    }


    // =================================================
    // VALIDATE MONGODB ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        electionId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid election ID.",
      });
    }


    // =================================================
    // FIND ELECTION
    // =================================================

    const election =
      await Election.findById(
        electionId
      );


    if (!election) {
      return res.status(404).json({
        success: false,
        message:
          "Election not found.",
      });
    }


    // =================================================
    // CHECK CURRENT TIME
    // =================================================

    const now =
      new Date();


    if (
      now < election.startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Voting has not started yet.",
      });
    }


    if (
      now >= election.endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Voting has ended.",
      });
    }


    // =================================================
    // CHECK STUDENT ELIGIBILITY
    // =================================================

    const eligibleStudent =
      election.eligibleVoters.find(
        (voter) =>
          voter.studentId ===
          studentId
      );


    if (!eligibleStudent) {
      return res.status(403).json({
        success: false,
        message:
          "You are not eligible to vote in this election.",
      });
    }


    // =================================================
    // CHECK CANDIDATE
    // =================================================

    const candidate =
      election.candidates.find(
        (item) =>
          item.studentId ===
          candidateStudentId
      );


    if (!candidate) {
      return res.status(400).json({
        success: false,
        message:
          "Selected candidate does not belong to this election.",
      });
    }


    // =================================================
    // CHECK WHETHER STUDENT ALREADY VOTED
    // =================================================

    const existingVote =
      await Vote.findOne({
        electionId:
          election._id,

        studentId,
      });


    if (existingVote) {
      return res.status(409).json({
        success: false,
        message:
          "You have already voted in this election.",
      });
    }


    // =================================================
    // CREATE VOTE TIME
    // =================================================

    const votedAt =
      new Date();


    // =================================================
    // GET PREVIOUS VOTE HASH
    // =================================================

    const previousVote =
      await Vote.findOne({
        electionId:
          election._id,
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "integrityHash"
        );


    // =================================================
    // PREVIOUS HASH
    // =================================================

    const previousHash =
      previousVote?.integrityHash ||
      "GENESIS";


    // =================================================
    // CREATE INTEGRITY HASH
    // =================================================

    const integrityHash =
      createVoteIntegrityHash({
        electionId:
          election._id.toString(),

        studentId,

        candidateStudentId:
          candidate.studentId,

        candidateName:
          candidate.name,

        votedAt,

        previousHash,
      });


    // =================================================
    // SAVE VOTE
    // =================================================

    const vote =
      await Vote.create({

        electionId:
          election._id,

        studentId,

        candidateStudentId:
          candidate.studentId,

        candidateName:
          candidate.name,

        votedAt,

        previousHash,

        integrityHash,
      });


    // =================================================
    // SUCCESS
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Vote recorded successfully.",

      vote: {
        id:
          vote._id,

        electionId:
          vote.electionId,

        candidateStudentId:
          vote.candidateStudentId,

        candidateName:
          vote.candidateName,

        votedAt:
          vote.votedAt,
      },
    });


  } catch (error) {

    console.error(
      "Cast Vote Error:",
      error
    );


    // =================================================
    // HANDLE UNIQUE INDEX DUPLICATE
    // =================================================

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already voted in this election.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Failed to record vote.",
    });
  }
};



// =====================================================
// GET ALL ELECTIONS FOR ADMIN RESULTS
// =====================================================

export const getAdminResultElections = async (
  req,
  res
) => {
  try {

    const elections =
      await Election.find({})
        .select(
          "title description startDate endDate status"
        )
        .sort({
          startDate: -1,
        });


    return res.status(200).json({
      success: true,
      elections,
    });


  } catch (error) {

    console.error(
      "Get Admin Result Elections Error:",
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
// VERIFY VOTE INTEGRITY
// =====================================================

const verifyElectionVoteIntegrity =
  async (electionId) => {

    // =================================================
    // GET ALL VOTES IN CHAIN ORDER
    // =================================================

    const votes =
      await Vote.find({
        electionId,
      })
        .sort({
          createdAt: 1,
          _id: 1,
        })
        .lean();


    // =================================================
    // FIRST VOTE MUST START FROM GENESIS
    // =================================================

    let expectedPreviousHash =
      "GENESIS";


    // =================================================
    // VERIFY EVERY VOTE
    // =================================================

    for (
      const vote of votes
    ) {

      // -----------------------------------------------
      // CHECK PREVIOUS HASH
      // -----------------------------------------------

      if (
        vote.previousHash !==
        expectedPreviousHash
      ) {
        return {
          valid: false,
          reason:
            "Vote chain has been modified.",
        };
      }


      // -----------------------------------------------
      // CHECK INTEGRITY HASH
      // -----------------------------------------------

      if (
        !vote.integrityHash
      ) {
        return {
          valid: false,
          reason:
            "A vote is missing its integrity hash.",
        };
      }


      let isValid = false;


      try {

        isValid =
          verifyVoteIntegrityHash({
            electionId:
              vote.electionId.toString(),

            studentId:
              vote.studentId,

            candidateStudentId:
              vote.candidateStudentId,

            candidateName:
              vote.candidateName,

            votedAt:
              vote.votedAt,

            previousHash:
              vote.previousHash,

            integrityHash:
              vote.integrityHash,
          });

      } catch (error) {

        console.error(
          "Vote Integrity Verification Error:",
          error
        );

        return {
          valid: false,
          reason:
            "Invalid vote integrity data.",
        };
      }


      if (!isValid) {
        return {
          valid: false,
          reason:
            "Vote data has been modified.",
        };
      }


      // -----------------------------------------------
      // NEXT VOTE MUST POINT TO THIS HASH
      // -----------------------------------------------

      expectedPreviousHash =
        vote.integrityHash;
    }


    // =================================================
    // ALL VOTES VALID
    // =================================================

    return {
      valid: true,
      reason:
        "All votes passed integrity verification.",
    };
  };



// =====================================================
// GET LIVE ELECTION RESULTS
// ADMIN ONLY
// =====================================================

export const getElectionResults = async (
  req,
  res
) => {
  try {

    const {
      electionId,
    } = req.params;


    // =================================================
    // VALIDATE ELECTION ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        electionId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid election ID.",
      });
    }


    // =================================================
    // FIND ELECTION
    // =================================================

    const election =
      await Election.findById(
        electionId
      );


    if (!election) {
      return res.status(404).json({
        success: false,
        message:
          "Election not found.",
      });
    }


    // =================================================
    // VERIFY VOTE INTEGRITY
    // =================================================

    const integrity =
      await verifyElectionVoteIntegrity(
        election._id
      );


    if (!integrity.valid) {

      console.error(
        `⚠️ Vote integrity failure for election ${election._id}: ${integrity.reason}`
      );

      return res.status(409).json({
        success: false,

        integrityVerified:
          false,

        message:
          "Vote integrity verification failed. Possible data tampering detected.",

        reason:
          integrity.reason,
      });
    }


    // =================================================
    // COUNT TOTAL VOTES
    // =================================================

    const totalVotes =
      await Vote.countDocuments({
        electionId:
          election._id,
      });


    // =================================================
    // COUNT VOTES PER CANDIDATE
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

            votes: {
              $sum: 1,
            },

          },
        },
      ]);


    // =================================================
    // CREATE LOOKUP MAP
    // =================================================

    const voteCountMap =
      new Map(
        voteCounts.map(
          (item) => [
            item._id,
            item.votes,
          ]
        )
      );


    // =================================================
    // INCLUDE EVERY CANDIDATE
    // EVEN IF 0 VOTES
    // =================================================

    const candidates =
      (election.candidates || []).map(
        (candidate) => {

          const votes =
            voteCountMap.get(
              candidate.studentId
            ) || 0;


          return {

            studentId:
              candidate.studentId,

            name:
              candidate.name,

            year:
              candidate.year,

            department:
              candidate.department,

            division:
              candidate.division,

            votes,

          };
        }
      );


    // =================================================
    // ELIGIBLE VOTERS
    // =================================================

    const eligibleVoters =
      election.eligibleVoters?.length ||
      0;


    // =================================================
    // TURNOUT
    // =================================================

    const turnout =
      eligibleVoters > 0
        ? Number(
            (
              (totalVotes /
                eligibleVoters) *
              100
            ).toFixed(2)
          )
        : 0;


    // =================================================
    // CURRENT STATUS
    // =================================================

    const now =
      new Date();


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

      integrityVerified:
        true,

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

        totalVotes,

        eligibleVoters,

        turnout,

        candidates,

      },

    });


  } catch (error) {

    console.error(
      "Get Election Results Error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch election results.",
    });
  }
};