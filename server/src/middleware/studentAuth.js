import jwt from "jsonwebtoken";
import Student from "../modules/students/student.model.js";

const studentAuth = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Student authentication token is required.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const student =
      await Student.findById(
        decoded.id
      ).select("-password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message:
          "Student account not found.",
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Student account is inactive.",
      });
    }

    req.student = student;

    next();

  } catch (error) {
    console.error(
      "Student Auth Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired student token.",
    });
  }
};

export default studentAuth;