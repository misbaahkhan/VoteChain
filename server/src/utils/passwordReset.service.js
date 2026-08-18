import crypto from "crypto";

import Student from "../modules/students/student.model.js";
import Admin from "../modules/admins/admin.model.js";
import PasswordReset from "../models/passwordReset.model.js";

import {
  sendPasswordResetOtp,
} from "./email.service.js";

// =====================================================
// OTP SETTINGS
// =====================================================

const OTP_EXPIRY_MINUTES = 10;

// =====================================================
// HASH OTP
// =====================================================

const hashValue = (value) => {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
};

// =====================================================
// GENERATE 6 DIGIT OTP
// =====================================================

const generateOtp = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

// =====================================================
// FIND USER
// =====================================================

const getUser = async (
  userType,
  email
) => {
  const cleanEmail =
    email.trim().toLowerCase();

  // ================= STUDENT =================

  if (userType === "student") {
    return await Student.findOne({
      instituteEmail: cleanEmail,
    });
  }

  // ================= ADMIN =================

  if (userType === "admin") {
    return await Admin.findOne({
      email: cleanEmail,
    });
  }

  return null;
};

// =====================================================
// REQUEST PASSWORD RESET
// =====================================================

export const requestPasswordReset =
  async (
    userType,
    email
  ) => {

    const cleanEmail =
      email.trim().toLowerCase();

    const user =
      await getUser(
        userType,
        cleanEmail
      );

    // =================================================
    // USER NOT REGISTERED
    // =================================================

    if (!user) {

      if (
        userType ===
        "student"
      ) {
        throw new Error(
          "You are not registered with VoteChain."
        );
      }

      if (
        userType ===
        "admin"
      ) {
        throw new Error(
          "You are not registered as an admin."
        );
      }

      throw new Error(
        "Account not found."
      );
    }

    // =================================================
    // CHECK IF USER IS ACTIVE
    // =================================================

    if (!user.isActive) {

      if (
        userType ===
        "student"
      ) {
        throw new Error(
          "Your account is inactive. Please contact the administrator."
        );
      }

      if (
        userType ===
        "admin"
      ) {
        throw new Error(
          "Your admin account is inactive. Please contact the primary administrator."
        );
      }
    }

    // =================================================
    // SUPER ADMIN PROTECTION
    // =================================================

    if (
      userType ===
      "admin" &&
      user.role ===
      "superAdmin"
    ) {
      throw new Error(
        "Password reset is not available for the primary administrator."
      );
    }

    // =================================================
    // DELETE OLD OTP REQUESTS
    // =================================================

    await PasswordReset.deleteMany({
      userId: user._id,
      userType,
    });

    // =================================================
    // GENERATE OTP
    // =================================================

    const otp =
      generateOtp();

    const otpHash =
      hashValue(otp);

    const expiresAt =
      new Date(
        Date.now() +
          OTP_EXPIRY_MINUTES *
            60 *
            1000
      );

    // =================================================
    // SAVE OTP HASH
    // =================================================

    await PasswordReset.create({
      userId:
        user._id,

      userType,

      email:
        cleanEmail,

      otpHash,

      expiresAt,

      verified:
        false,
    });

    // =================================================
    // SEND EMAIL
    // =================================================

    try {

      await sendPasswordResetOtp({
        to:
          cleanEmail,

        recipientName:
          user.fullName ||
          "User",

        otp,

        userType,
      });

    } catch (error) {

      // If email fails, remove OTP
      await PasswordReset.deleteMany({
        userId:
          user._id,

        userType,
      });

      throw new Error(
        "Unable to send password reset email. Please try again."
      );
    }

    return {
      message:
        "OTP has been sent to your registered email.",
    };
  };

// =====================================================
// VERIFY OTP
// =====================================================

export const verifyPasswordResetOtp =
  async (
    userType,
    email,
    otp
  ) => {

    const cleanEmail =
      email.trim().toLowerCase();

    // OTP must be exactly 6 digits
    if (
      !/^\d{6}$/.test(otp)
    ) {
      throw new Error(
        "OTP must be 6 digits."
      );
    }

    // =================================================
    // FIND VALID OTP
    // =================================================

    const resetRequest =
      await PasswordReset.findOne({
        email:
          cleanEmail,

        userType,

        expiresAt: {
          $gt: new Date(),
        },
      }).sort({
        createdAt: -1,
      });

    if (!resetRequest) {
      throw new Error(
        "OTP is invalid or expired."
      );
    }

    // =================================================
    // CHECK IF ALREADY VERIFIED
    // =================================================

    if (
      resetRequest.verified
    ) {
      throw new Error(
        "OTP has already been verified."
      );
    }

    // =================================================
    // COMPARE OTP HASH
    // =================================================

    const isCorrect =
      hashValue(otp) ===
      resetRequest.otpHash;

    if (!isCorrect) {
      throw new Error(
        "Invalid OTP."
      );
    }

    // =================================================
    // MARK OTP VERIFIED
    // =================================================

    resetRequest.verified =
      true;

    await resetRequest.save();

    return {
      message:
        "OTP verified successfully.",
    };
  };

// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword =
  async (
    userType,
    email,
    newPassword
  ) => {

    const cleanEmail =
      email.trim().toLowerCase();

    // =================================================
    // PASSWORD VALIDATION
    // =================================================

    if (
      !newPassword ||
      newPassword.length < 8
    ) {
      throw new Error(
        "Password must be at least 8 characters long."
      );
    }

    // =================================================
    // FIND VERIFIED OTP SESSION
    // =================================================

    const resetRequest =
      await PasswordReset.findOne({
        email:
          cleanEmail,

        userType,

        verified:
          true,

        expiresAt: {
          $gt: new Date(),
        },
      }).sort({
        createdAt: -1,
      });

    if (!resetRequest) {
      throw new Error(
        "Password reset session is invalid or expired."
      );
    }

    // =================================================
    // STUDENT PASSWORD RESET
    // =================================================

    if (
      userType ===
      "student"
    ) {

      const student =
        await Student.findOne({
          _id:
            resetRequest.userId,

          instituteEmail:
            cleanEmail,
        });

      if (!student) {
        throw new Error(
          "Student account not found."
        );
      }

      // Make sure inactive accounts
      // cannot be reset through an old session
      if (!student.isActive) {
        throw new Error(
          "Your account is inactive. Please contact the administrator."
        );
      }

      student.password =
        newPassword;

      student.firstLogin =
        false;

      await student.save();
    }

    // =================================================
    // NORMAL ADMIN PASSWORD RESET
    // =================================================

    else if (
      userType ===
      "admin"
    ) {

      const admin =
        await Admin.findOne({
          _id:
            resetRequest.userId,

          email:
            cleanEmail,

          // SuperAdmin protection
          role:
            "admin",
        });

      if (!admin) {
        throw new Error(
          "Admin account not found."
        );
      }

      // Make sure inactive admins
      // cannot be reset through an old session
      if (!admin.isActive) {
        throw new Error(
          "Your admin account is inactive. Please contact the primary administrator."
        );
      }

      admin.password =
        newPassword;

      await admin.save();
    }

    // =================================================
    // INVALID USER TYPE
    // =================================================

    else {
      throw new Error(
        "Password reset is not available for this account."
      );
    }

    // =================================================
    // DELETE RESET SESSION
    // =================================================

    await PasswordReset.deleteMany({
      userId:
        resetRequest.userId,

      userType,
    });

    return {
      message:
        "Password reset successfully. You can now log in.",
    };
  };