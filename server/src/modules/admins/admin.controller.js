import adminService from "./admin.service.js";
import {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
} from "../../utils/passwordReset.service.js";

// =====================================================
// ADMIN LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    // Get data from request body
    const {
      employeeId,
      password,
    } = req.body;

    // Basic validation
    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID and Password are required",
      });
    }

    // Call service
    const data =
      await adminService.loginAdmin(
        employeeId,
        password
      );

    // Success response
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      ...data,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// CREATE NEW ADMIN
// ONLY SUPER ADMIN CAN CREATE ADMINS
// =====================================================

const createAdmin = async (
  req,
  res
) => {
  try {

    // =================================================
    // CHECK SUPER ADMIN
    // =================================================

    if (
      !req.admin ||
      req.admin.role !==
        "superAdmin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the primary administrator can add new admins.",
      });
    }

    // =================================================
    // GET DATA FROM REQUEST
    // =================================================

    const {
      employeeId,
      fullName,
      email,
      password,
    } = req.body;

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (
      !employeeId ||
      !fullName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee ID, Full Name, Email and Password are required.",
      });
    }

    // =================================================
    // CALL SERVICE
    // =================================================

    const data =
      await adminService.createAdmin({
        employeeId,
        fullName,
        email,
        password,
      });

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        "New admin created successfully.",
      ...data,
    });

  } catch (error) {

    console.error(
      "Create Admin Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create admin.",
    });
  }
};
// =====================================================
// ADMIN FORGOT PASSWORD
// NORMAL ADMIN ONLY
// =====================================================

const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const result =
      await requestPasswordReset(
        "admin",
        email
      );

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error(
      "Admin Forgot Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to process password reset.",
    });
  }
};


// =====================================================
// ADMIN VERIFY OTP
// =====================================================

const verifyOtp = async (
  req,
  res
) => {
  try {
    const {
      email,
      otp,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required.",
      });
    }

    const result =
      await verifyPasswordResetOtp(
        "admin",
        email,
        otp
      );

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "OTP verification failed.",
    });
  }
};


// =====================================================
// ADMIN RESET PASSWORD
// =====================================================

const resetPasswordController =
  async (
    req,
    res
  ) => {
    try {
      const {
        email,
        newPassword,
      } = req.body;

      if (
        !email ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and new password are required.",
        });
      }

      const result =
        await resetPassword(
          "admin",
          email,
          newPassword
        );

      return res.status(200).json({
        success: true,
        ...result,
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to reset password.",
      });
    }
  };

// =====================================================
// EXPORT
// =====================================================

export default {
  login,
  createAdmin,
  forgotPassword,
  verifyOtp,
  resetPasswordController,
};