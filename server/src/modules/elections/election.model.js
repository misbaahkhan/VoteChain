import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Election title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Election description is required"],
      trim: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    status: {
      type: String,
      enum: [
        "draft",
        "upcoming",
        "active",
        "completed",
      ],
      default: "draft",
    },

    // =================================================
    // ELIGIBLE VOTERS
    // =================================================

    eligibleVoters: [
      {
        studentId: {
          type: String,
          required: true,
          trim: true,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        instituteEmail: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },

        year: {
          type: String,
          required: true,
          enum: [
            "FE",
            "SE",
            "TE",
            "BE",
          ],
        },

        department: {
          type: String,
          required: true,
          trim: true,
        },

        division: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    // =================================================
    // CANDIDATES
    // =================================================
    // Candidates are selected from the eligible voters
    // of THIS election.

    candidates: [
      {
        studentId: {
          type: String,
          required: true,
          trim: true,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        instituteEmail: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },

        year: {
          type: String,
          required: true,
          enum: [
            "FE",
            "SE",
            "TE",
            "BE",
          ],
        },

        department: {
          type: String,
          required: true,
          trim: true,
        },

        division: {
          type: String,
          required: true,
          trim: true,
        },

        // Position can be added/used later
        // during candidate selection.
      },
    ],

    // =================================================
    // ADMIN WHO CREATED THE ELECTION
    // =================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Election = mongoose.model(
  "Election",
  electionSchema
);

export default Election;