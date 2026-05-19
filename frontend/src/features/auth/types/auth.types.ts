export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  accessToken?: string;
  "user-role"?: string;
  "user-name"?: string;
  "user-email"?: string;
  "user-id"?: number | string;
  field?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}
