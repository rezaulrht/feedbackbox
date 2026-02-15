import { Resend } from "resend";
import { render } from "@react-email/render";

import VerifyEmail from "@/emails/VerifyEmail";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM;

if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY in .env.local");
if (!MAIL_FROM) throw new Error("Missing MAIL_FROM in .env.local");

const resend = new Resend(RESEND_API_KEY);

export async function sendVerifyEmail(args: {
  to: string;
  username: string;
  code: string;
}) {
  const html = await render(
    VerifyEmail({ username: args.username, code: args.code }),
  );

  return resend.emails.send({
    from: MAIL_FROM!,
    to: args.to,
    subject: "Your FeedbackBox verification code",
    html,
  });
}
