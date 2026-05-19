const isEmail = (value) => /\S+@\S+\.\S+/.test(String(value || ""));

export const validateLoginBody = (req) => {
  const errors = [];
  const { email, password } = req.body || {};

  if (!isEmail(email))
    errors.push({ field: "email", message: "Invalid email" });
  if (!password || String(password).length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters",
    });
  }

  return errors;
};

export const validateForgotPasswordBody = (req) => {
  const errors = [];
  const { email } = req.body || {};
  if (!isEmail(email))
    errors.push({ field: "email", message: "Invalid email" });
  return errors;
};

export const validateResetPasswordBody = (req) => {
  const errors = [];
  const { token, newPassword, confirmPassword } = req.body || {};

  if (!token || String(token).length < 10) {
    errors.push({ field: "token", message: "Invalid reset token" });
  }

  if (!newPassword || String(newPassword).length < 8) {
    errors.push({
      field: "newPassword",
      message: "Password must be at least 8 characters",
    });
  }

  if (newPassword !== confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Passwords do not match",
    });
  }

  return errors;
};
