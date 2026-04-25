import transporter from "../config/mail.js";

const sendCredentialsEmail = async (name, email, password) => {
  try {
    await transporter.sendMail({
      from: ' "EMS Admin" <ibrahimabuu37@gmail.com>',
      to: email,
      subject: "Your EMS Account Credentials",
      html: ` 
                <p>Hello ${name},</p>
                <p>Your account has been created:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p>Please change your password after logging in for the first time.</p>
                <br/>
                <p>Best regards,<br/>EMS Admin</p>
            `,
    });
  } catch (error) {
    console.log("Failed to send email:", error);
  }
};

const sendPasswordResetEmail = async (name, email, resetUrl) => {
  try {
    await transporter.sendMail({
      from: '"EMS Admin" <ibrahimabuu37@gmail.com>',
      to: email,
      subject: "Password Reset Request – EMS",
      html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
                    <h2 style="color:#1e3a5f;margin-bottom:8px;">Reset Your Password</h2>
                    <p style="color:#475569;">Hello <strong>${name}</strong>,</p>
                    <p style="color:#475569;">We received a request to reset your EMS account password. Click the button below to set a new password.</p>
                    <a href="${resetUrl}"
                       style="display:inline-block;margin:20px 0;padding:12px 28px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
                        Reset Password
                    </a>
                    <p style="color:#94a3b8;font-size:13px;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
                    <p style="color:#94a3b8;font-size:12px;">EMS – Employee Management System</p>
                </div>
            `,
    });
  } catch (error) {
    console.log("Failed to send password reset email:", error);
  }
};

export { sendCredentialsEmail, sendPasswordResetEmail };
