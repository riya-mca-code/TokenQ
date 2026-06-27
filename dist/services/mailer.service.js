"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = sendResetPasswordEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
function hasMailerConfig() {
    return Boolean(env_1.env.smtp.host && env_1.env.smtp.user && env_1.env.smtp.pass);
}
async function sendResetPasswordEmail(to, resetUrl) {
    if (!hasMailerConfig())
        return;
    const transporter = nodemailer_1.default.createTransport({
        host: env_1.env.smtp.host,
        port: env_1.env.smtp.port,
        secure: env_1.env.smtp.port === 465,
        auth: {
            user: env_1.env.smtp.user,
            pass: env_1.env.smtp.pass,
        },
    });
    await transporter.sendMail({
        from: env_1.env.smtp.from,
        to,
        subject: "Reset your TokenQ password",
        text: `Reset your password using this link: ${resetUrl}`,
        html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
}
