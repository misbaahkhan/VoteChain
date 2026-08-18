import dotenv from "dotenv";
import connectDB from "./src/db/database.js";
import Student from "./src/modules/students/student.model.js";

dotenv.config();

const createStudent = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check whether student already exists
    const existingStudent = await Student.findOne({
      studentId: "23104227",
    });

    if (existingStudent) {
      console.log("✅ Student already exists!");
      process.exit(0);
    }

    // Create test student
    const student = await Student.create({
      studentId: "23104227",
      fullName: "Misbaah Khan",
      instituteEmail: "23105028@apsit.edu.in",
      department: "Information Technology",
      year: "BE",
      division: "C",
      className: "BE IT",
      password: "23104227@Apsit",
      firstLogin: true,
      isActive: true,
    });

    console.log("🎉 Test Student Created Successfully!");
    console.log({
      studentId: student.studentId,
      fullName: student.fullName,
      email: student.instituteEmail,
      department: student.department,
      year: student.year,
      division: student.division,
      className: student.className,
    });

    process.exit(0);

  } catch (error) {
    console.error("❌ Error creating student:");
    console.error(error.message);

    process.exit(1);
  }
};

createStudent();