import { z } from "zod";

const username = z
  .string()
  .min(3)
  .max(20)
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  );
const email = z
  .string()
  .trim()
  .email("Invalid email address")
  .transform((val) => val.toLowerCase());
const password = z
  .string()
  .min(8)
  .max(72)
  .refine((v) => /[A-Z]/.test(v), "Must contain at least 1 uppercase letter")
  .refine((v) => /[a-z]/.test(v), "Must contain at least 1 lowercase letter")
  .refine((v) => /\d/.test(v), "Must contain at least 1 number");

export const signupSchema = z.object({
  username,
  email,
  password,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email,
  password,
});

export type SigninInput = z.infer<typeof signinSchema>;

export const verifyEmailSchema = z.object({
  email,
  code: z.string().trim().length(6, "Code must be 6 digits"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendCodeSchema = z.object({
  email
});

export type ResendCodeInput = z.infer<typeof resendCodeSchema>;