import "dotenv/config";
import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPassword =
  process.env.EMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

export const sendPasswordResetOtp = async ({
  to,
  recipientName,
  otp,
  userType,
}) => {
  const portalName =
    userType === "student"
      ? "Student Voting Portal"
      : "Admin Portal";

  try {
    const info = await transporter.sendMail({
      from: `"VoteChain" <${emailUser}>`,
      to,

      subject:
        "VoteChain Password Reset OTP",

      text:
        `Hello ${
          recipientName || "User"
        },\n\n` +
        `Your VoteChain password reset OTP is: ${otp}\n\n` +
        `This OTP is valid for 10 minutes.\n` +
        `Do not share this OTP with anyone.\n\n` +
        `VoteChain - ${portalName}`,

      html: `
        <div style="
          margin:0;
          padding:30px;
          background:#17101d;
          font-family:Arial,Helvetica,sans-serif;
          color:#ffffff;
        ">

          <div style="
            max-width:520px;
            margin:0 auto;
            padding:30px;
            border-radius:16px;
            background:#2b1c32;
            border:1px solid rgba(255,255,255,0.15);
          ">

            <div style="
              font-size:11px;
              letter-spacing:2px;
              color:rgba(255,255,255,0.45);
              margin-bottom:10px;
            ">
              VOTECHAIN
            </div>

            <h2 style="
              margin:0 0 12px;
              font-size:24px;
            ">
              Password Reset
            </h2>

            <p style="
              color:rgba(255,255,255,0.65);
              font-size:14px;
              line-height:1.6;
            ">
              Hello ${
                recipientName || "User"
              },<br/>
              Use the OTP below to reset
              your VoteChain password.
            </p>

            <div style="
              margin:25px 0;
              padding:18px;
              text-align:center;
              border-radius:10px;
              background:#1f1525;
              border:1px solid rgba(255,255,255,0.12);
              font-size:30px;
              font-weight:700;
              letter-spacing:8px;
            ">
              ${otp}
            </div>

            <p style="
              color:#fca5a5;
              font-size:12px;
            ">
              This OTP expires in 10 minutes.
              Do not share it with anyone.
            </p>

            <p style="
              margin-top:25px;
              color:rgba(255,255,255,0.35);
              font-size:11px;
            ">
              If you did not request a password
              reset, you can safely ignore this email.
            </p>

          </div>
        </div>
      `,
    });

    console.log(
      "✅ Password reset email sent:",
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      "❌ Nodemailer Error:",
      error
    );

    throw error;
  }
};