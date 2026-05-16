// import express from "express";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// import Otp from "../models/Otp.js";

// dotenv.config();
// const router = express.Router();

// const generateOtp = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();

// // Gmail SMTP configuration
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// // Verify connection at startup
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ Gmail connection error:", error);
//   } else {
//     console.log("✅ Gmail SMTP ready to send emails");
//   }
// });

// router.post("/send-otp", async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: "Missing email address" });
//   }

//   const otp = generateOtp();
//   const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//   try {
//     // Save OTP in database
//     await Otp.create({ email, code: otp, expiresAt });

//     // Send email
//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: "Your OTP code - WorkNest",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
//             <h1 style="color: white; margin: 0; text-align: center;">WorkNest</h1>
//           </div>
//           <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
//             <h2 style="color: #333; margin-top: 0;">Verification code</h2>
//             <p style="color: #666; font-size: 16px;">Your one-time code is:</p>
//             <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
//               <h1 style="color: #667eea; letter-spacing: 8px; margin: 0; font-size: 36px;">${otp}</h1>
//             </div>
//             <p style="color: #666; font-size: 14px;">The code is valid for <strong>5 minutes</strong>.</p>
//             <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
//               If you did not request this code, ignore this message.
//             </p>
//           </div>
//         </div>
//       `,
//       text: `WorkNest - Your verification code\n\nYour one-time code is: ${otp}\n\nThe code is valid for 5 minutes.\n\nIf you did not request this code, ignore this message.`,
//     };
//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({
//       message: "OTP code sent successfully",
//     });
//   } catch (err) {
//     console.error("❌ Send or save error:", err);
//     console.error("Error details:", err.message);
//     if (err.response) {
//       console.error("Server response:", err.response);
//     }
//     return res.status(500).json({
//       message: "Server error",
//       error: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// });

// router.post("/verify-otp", async (req, res) => {
//   const { email, code } = req.body;

//   if (!email || !code) {
//     return res.status(400).json({ message: "Missing email or code" });
//   }

//   try {
//     const record = await Otp.findOne({ email, code });

//     if (!record) {
//       return res.status(400).json({ message: "Invalid code" });
//     }

//     if (record.expiresAt < new Date()) {
//       await Otp.deleteOne({ _id: record._id });
//       return res.status(400).json({ message: "Code expired" });
//     }

//     // Remove OTP after successful use
//     await Otp.deleteOne({ _id: record._id });

//     return res.status(200).json({ message: "Code valid" });
//   } catch (err) {
//     console.error("❌ Verification error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;
