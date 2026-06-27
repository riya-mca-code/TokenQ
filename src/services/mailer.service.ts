import nodemailer from "nodemailer";
import { env } from "../config/env";

function hasMailerConfig() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  if (!hasMailerConfig()) return;

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: "Reset your TokenQ password",
    text: `Reset your password using this link: ${resetUrl}`,
    html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}
