import dotenv from "dotenv";
import connectDB from "./db/database.js";
import Admin from "./modules/admins/admin.model.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // =====================================================
    // CHECK IF DEFAULT ADMIN ALREADY EXISTS
    // =====================================================

    const existingAdmin = await Admin.findOne({
      employeeId:
        process.env.DEFAULT_ADMIN_ID,
    });

    // =====================================================
    // IF EXISTS, MAKE SURE IT IS SUPER ADMIN
    // =====================================================

    if (existingAdmin) {
      existingAdmin.role = "superAdmin";
      existingAdmin.isActive = true;

      await existingAdmin.save();

      console.log(
        "✅ Default SuperAdmin already exists!"
      );

      console.log(
        "🔐 Role verified as: superAdmin"
      );

      process.exit(0);
    }

    // =====================================================
    // CREATE DEFAULT SUPER ADMIN
    // =====================================================

    const admin = new Admin({
      employeeId:
        process.env.DEFAULT_ADMIN_ID,

      fullName:
        process.env.DEFAULT_ADMIN_NAME,

      email:
        process.env.DEFAULT_ADMIN_EMAIL,

      password:
        process.env.DEFAULT_ADMIN_PASSWORD,

      // Default account is always SuperAdmin
      role: "superAdmin",

      isActive: true,
    });

    await admin.save();

    console.log(
      "🎉 Default SuperAdmin Created Successfully!"
    );

    console.log(
      "--------------------------------------"
    );

    console.log(
      `Employee ID : ${process.env.DEFAULT_ADMIN_ID}`
    );

    console.log(
      `Password    : ${process.env.DEFAULT_ADMIN_PASSWORD}`
    );

    console.log(
      "Role        : superAdmin"
    );

    process.exit(0);

  } catch (error) {
    console.error(
      "❌ Error creating default SuperAdmin"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
};

createAdmin();