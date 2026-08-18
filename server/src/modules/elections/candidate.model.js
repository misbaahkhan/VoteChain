import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },

    studentId: {
      type: String,
      required: [true, "Candidate Student ID is required"],
      trim: true,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    year: {
      type: String,
      required: [true, "Year is required"],
      enum: ["FE", "SE", "TE", "BE"],
    },

    division: {
      type: String,
      required: [true, "Division is required"],
      trim: true,
    },

    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },

    manifesto: {
      type: String,
      default: "",
      trim: true,
    },

    photo: {
      type: String,
      default: "",
    },

    votes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model(
  "Candidate",
  candidateSchema
);

export default Candidate;