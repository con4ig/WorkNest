// import express from "express";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// import Otp from "../models/Otp.js";

// dotenv.config();
// const router = express.Router();

// const generateOtp = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();

// // Konfiguracja Gmail SMTP
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// // Weryfikacja połączenia przy starcie
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ Błąd połączenia z Gmail:", error);
//   } else {
//     console.log("✅ Gmail SMTP gotowe do wysyłki maili");
//   }
// });

// router.post("/send-otp", async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: "Brak adresu email" });
//   }

//   const otp = generateOtp();
//   const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minut

//   try {
//     // Zapis OTP w bazie
//     await Otp.create({ email, code: otp, expiresAt });

//     // Wysłanie maila
//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: "Twój kod OTP - WorkNest",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
//             <h1 style="color: white; margin: 0; text-align: center;">WorkNest</h1>
//           </div>
//           <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
//             <h2 style="color: #333; margin-top: 0;">Kod weryfikacyjny</h2>
//             <p style="color: #666; font-size: 16px;">Twój kod jednorazowy to:</p>
//             <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
//               <h1 style="color: #667eea; letter-spacing: 8px; margin: 0; font-size: 36px;">${otp}</h1>
//             </div>
//             <p style="color: #666; font-size: 14px;">Kod jest ważny przez <strong>5 minut</strong>.</p>
//             <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
//               Jeśli nie prosiłeś o ten kod, zignoruj tę wiadomość.
//             </p>
//           </div>
//         </div>
//       `,
//       text: `WorkNest - Twój kod weryfikacyjny\n\nTwój kod jednorazowy to: ${otp}\n\nKod jest ważny przez 5 minut.\n\nJeśli nie prosiłeś o ten kod, zignoruj tę wiadomość.`,
//     };
//     await transporter.sendMail(mailOptions);

//     return res.status(200).json({
//       message: "Kod OTP wysłany pomyślnie",
//     });
//   } catch (err) {
//     console.error("❌ Błąd wysyłki lub zapisu:", err);
//     console.error("Szczegóły błędu:", err.message);
//     if (err.response) {
//       console.error("Odpowiedź serwera:", err.response);
//     }
//     return res.status(500).json({
//       message: "Błąd serwera",
//       error: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// });

// router.post("/verify-otp", async (req, res) => {
//   const { email, code } = req.body;

//   if (!email || !code) {
//     return res.status(400).json({ message: "Brak email lub kodu" });
//   }

//   try {
//     const record = await Otp.findOne({ email, code });

//     if (!record) {
//       return res.status(400).json({ message: "Nieprawidłowy kod" });
//     }

//     if (record.expiresAt < new Date()) {
//       await Otp.deleteOne({ _id: record._id });
//       return res.status(400).json({ message: "Kod wygasł" });
//     }

//     // Usuń OTP po poprawnym użyciu
//     await Otp.deleteOne({ _id: record._id });

//     return res.status(200).json({ message: "Kod poprawny" });
//   } catch (err) {
//     console.error("❌ Błąd weryfikacji:", err);
//     return res.status(500).json({ message: "Błąd serwera" });
//   }
// });

// export default router;
