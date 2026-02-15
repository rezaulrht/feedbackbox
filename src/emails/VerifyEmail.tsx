import * as React from "react";
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Heading,
    Text,
    Hr,
} from "@react-email/components";

type VerifyEmailProps = {
    username: string;
    code: string;
};

export default function VerifyEmail({ username, code }: VerifyEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your verification code: {code}</Preview>

            <Body style={{ fontFamily: "Arial, sans-serif" }}>
                <Container style={{ maxWidth: "520px", padding: "24px" }}>
                    <Heading>Verify your email</Heading>

                    <Text>Hi {username},</Text>
                    <Text>Use this code to verify your email:</Text>

                    <Section
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            padding: "16px",
                            textAlign: "center",
                            letterSpacing: "6px",
                            fontSize: "24px",
                            fontWeight: 700,
                        }}
                    >
                        {code}
                    </Section>

                    <Text style={{ marginTop: "16px" }}>
                        This code expires in 10 minutes.
                    </Text>

                    <Hr style={{ margin: "20px 0" }} />

                    <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                        If you didn’t request this, ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}
