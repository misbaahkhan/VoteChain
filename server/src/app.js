import express from "express";
import cors from "cors";
import helmet from "helmet";
import Student from "./modules/students/student.model.js";
import electionRoutes from "./modules/elections/election.routes.js";
import adminRoutes from "./modules/admins/admin.routes.js";
import studentRoutes from "./modules/students/student.routes.js";
import voteRoutes from "./modules/votes/vote.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());


// ================= ROUTES =================

app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/votes", voteRoutes);

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to VoteChain API",
  });
});

// ================= TEST STUDENT MODEL =================

app.get("/test-student", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    res.status(200).json({
      success: true,
      message: "Student Model Working Successfully ✅",
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default app;