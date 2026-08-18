import Admin from "./admin.model.js";
import generateToken from "../../utils/generateToken.js";


// =====================================================
// ADMIN LOGIN
// =====================================================

const loginAdmin = async (
  employeeId,
  password
) => {

  // Find admin by Employee ID
  const admin =
    await Admin.findOne({
      employeeId,
    });


  if (!admin) {
    throw new Error(
      "Invalid Employee ID"
    );
  }


  // Check if admin is active
  if (!admin.isActive) {
    throw new Error(
      "Admin account is inactive"
    );
  }


  // Compare Password
  const isPasswordCorrect =
    await admin.comparePassword(
      password
    );


  if (!isPasswordCorrect) {
    throw new Error(
      "Invalid Password"
    );
  }


  // Generate JWT
  const token =
    generateToken(
      admin._id,
      admin.role
    );


  return {
    token,

    admin: {
      id: admin._id,
      employeeId:
        admin.employeeId,
      fullName:
        admin.fullName,
      role:
        admin.role,
    },
  };
};


// =====================================================
// CREATE NEW ADMIN
// ONLY SUPER ADMIN
// =====================================================

const createAdmin = async ({
  employeeId,
  fullName,
  email,
  password,
}) => {

  // ===================================================
  // CLEAN INPUT
  // ===================================================

  const cleanEmployeeId =
    employeeId.trim();

  const cleanFullName =
    fullName.trim();

  const cleanEmail =
    email.trim().toLowerCase();


  // ===================================================
  // CHECK EXISTING EMPLOYEE ID
  // ===================================================

  const existingEmployee =
    await Admin.findOne({
      employeeId:
        cleanEmployeeId,
    });

  if (existingEmployee) {
    throw new Error(
      "An admin with this Employee ID already exists."
    );
  }


  // ===================================================
  // CHECK EXISTING EMAIL
  // ===================================================

  const existingEmail =
    await Admin.findOne({
      email:
        cleanEmail,
    });

  if (existingEmail) {
    throw new Error(
      "An admin with this email already exists."
    );
  }


  // ===================================================
  // CREATE ADMIN
  // ===================================================

  const admin =
    await Admin.create({

      employeeId:
        cleanEmployeeId,

      fullName:
        cleanFullName,

      email:
        cleanEmail,

      password,

      // New admins are normal admins
      role: "admin",

      isActive: true,
    });


  // ===================================================
  // RETURN ADMIN DETAILS
  // ===================================================

  return {
    admin: {
      id: admin._id,
      employeeId:
        admin.employeeId,
      fullName:
        admin.fullName,
      email:
        admin.email,
      role:
        admin.role,
      isActive:
        admin.isActive,
    },
  };
};


// =====================================================
// EXPORT
// =====================================================

export default {
  loginAdmin,
  createAdmin,
};