import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/database.js";
import studentRoutes from "./modules/students/student.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 VoteChain Server running on port ${PORT}`);
  });
};

startServer();