import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";

configDotenv();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmailOtp = async (email, otp)=>{
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verificati OTP for Snake Sluther Game",
        html: `your OTP for verifying your email at Snake Sluther Game is ${otp}, this otp is valid for next 10 minute`,
    });
}


export default sendEmailOtp;