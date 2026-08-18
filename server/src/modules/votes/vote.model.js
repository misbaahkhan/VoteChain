import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    // =================================================
    // ELECTION
    // =================================================

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    // =================================================
    // STUDENT WHO VOTED
    // =================================================

    studentId: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // CANDIDATE SELECTED
    // =================================================

    candidateStudentId: {
      type: String,
      required: true,
      trim: true,
    },

    candidateName: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // VOTE TIME
    // =================================================

    votedAt: {
      type: Date,
      default: Date.now,
    },

    // =================================================
    // VOTE INTEGRITY
    // =================================================

    previousHash: {
      type: String,
      default: "GENESIS",
    },

    integrityHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// ONE STUDENT = ONE VOTE PER ELECTION
// =====================================================

voteSchema.index(
  {
    electionId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

const Vote = mongoose.model(
  "Vote",
  voteSchema
);

export default Vote;