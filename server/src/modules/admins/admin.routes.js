import express from "express";
import adminController from "./admin.controller.js";
import adminAuth from "../../middleware/adminAuth.js";

const router = express.Router();


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post(
  "/login",
  adminController.login
);


// =====================================================
// CREATE NEW ADMIN
// SUPER ADMIN ONLY
// =====================================================

router.post(
  "/create-admin",
  adminAuth,
  adminController.createAdmin
);
// =====================================================
// FORGOT PASSWORD
// NORMAL ADMIN ONLY
// =====================================================

router.post(
  "/forgot-password",
  adminController.forgotPassword
);

router.post(
  "/verify-otp",
  adminController.verifyOtp
);

router.post(
  "/reset-password",
  adminController.resetPasswordController
);

export default router;