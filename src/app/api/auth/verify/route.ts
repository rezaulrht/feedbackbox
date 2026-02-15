import { dbConnect } from "@/lib/db";
import UserModel from "@/models/User";
import { verifyEmailSchema } from "@/validators/auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    await dbConnect();

    // validate input
    const body = await verifyEmailSchema.parse(await req.json());

    //   find user by email
    const user = await UserModel.findOne({ email: body.email });

    //   if user not found or code expired or code doesn't match, return error
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid code or code expired or email not found",
        },
        {
          status: 400,
        },
      );
    }

    //   if email already verified, return success (idempotent)
    if (user.emailVerified) {
      return NextResponse.json(
        {
          ok: true,
          message: "Email already verified",
        },
        { status: 200 },
      );
    }

    const codeOk = user.verifyCode === body.code;
    const notExpired =
      user.verifyCodeExpiry instanceof Date &&
      user.verifyCodeExpiry.getTime() > Date.now();

    if (!codeOk || !notExpired) {
      return NextResponse.json(
        { ok: false, message: "Invalid code or expired" },
        { status: 400 },
      );
    }

    //   update user to set emailVerified to true and remove code and expiry
    user.emailVerified = true;
    user.verifyCode = null;
    user.verifyCodeExpiry = null;
    await user.save();

    return NextResponse.json(
      { ok: true, message: "Email verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    if(error instanceof ZodError){
        return NextResponse.json(
            { ok: false, errors: error.flatten().fieldErrors         },
            { status: 400 }
        );
    }
    console.error("Email verification error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
