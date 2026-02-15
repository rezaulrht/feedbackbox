import { NextResponse } from "next/server";
import { ZodError } from "zod";

import UserModel from "@/models/User";
import { resendCodeSchema } from "@/validators/auth";
import { sendVerifyEmail } from "@/lib/mailer";
import { dbConnect } from "@/lib/db";

function generate6DigitCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, "0");
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = resendCodeSchema.parse(await req.json());

    const user = await UserModel.findOne({ email: body.email });

    // Don’t leak whether the email exists
    if (!user) {
      return NextResponse.json(
        { ok: true, message: "If the email exists, a code was sent." },
        { status: 200 },
      );
    }

    // If already verified, no need to send
    if (user.emailVerified) {
      return NextResponse.json(
        { ok: true, message: "Email already verified." },
        { status: 200 },
      );
    }

    // Generate new code + expiry
    const verifyCode = generate6DigitCode();
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = verifyCodeExpiry;
    await user.save();

    // send verification email (skip in dev mode)
    if (process.env.NODE_ENV !== "development") {
      await sendVerifyEmail({
        to: user.email,
        username: user.username,
        code: verifyCode,
      });
    } else {
      console.log(
        `[DEV] Resent verification code for ${user.email}: ${verifyCode}`,
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Verification code sent.",
        devOnlyCode:
          process.env.NODE_ENV === "development" ? verifyCode : undefined,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { ok: false, errors: err.flatten().fieldErrors },
        { status: 400 },
      );
    }

    console.error("Resend code error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
