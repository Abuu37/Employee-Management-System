import nodemailer from "nodemailer";
import { env } from "./env.js";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: env.mail.user,
    pass: env.mail.pass,
  },
});

export default transporter;
