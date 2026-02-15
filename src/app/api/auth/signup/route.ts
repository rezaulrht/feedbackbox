import { dbConnect } from "@/lib/db";
import { sendVerifyEmail } from "@/lib/mailer";
import UserModel from "@/models/User";
import { signupSchema } from "@/validators/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

function generate6DigitCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = signupSchema.parse(await req.json());

    // Check if user already exists
    const existing = await UserModel.findOne({
      $or: [{ email: body.email }, { username: body.username }],
    });

    // if user exists, return error
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Account Already exists" },
        { status: 409 },
      );
    }

    // hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    // create verification code + expiry
    const verifyCode = generate6DigitCode();
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // create user
    await UserModel.create({
      username: body.username,
      email: body.email,
      passwordHash,
      emailVerified: false,
      verifyCode,
      verifyCodeExpiry,
    });

    // send verification email
    await sendVerifyEmail({
      to: body.email,
      username: body.username,
      code: verifyCode,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Signup successful. Please verify your email.",
        devOnlyCode:
          process.env.NODE_ENV === "development" ? verifyCode : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError){
        return NextResponse.json(
            { ok: false, errors: error.flatten().fieldErrors         },
            { status: 400 }
        );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

