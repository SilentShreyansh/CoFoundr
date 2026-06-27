import nodemailer from "nodemailer";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getTransport() {
  const host = process.env.EMAIL_SERVER_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

async function send(to: string, subject: string, html: string, devLink?: string) {
  const transport = getTransport();
  if (!transport) {
    // Dev fallback: no SMTP configured — log the action link to the server console.
    console.log(`\n📧 [dev email] To: ${to}\n   Subject: ${subject}`);
    if (devLink) console.log(`   Link: ${devLink}\n`);
    return;
  }
  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? "CoFoundr <no-reply@cofoundr.local>",
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${appUrl}/verify-email?token=${token}`;
  await send(
    to,
    "Verify your CoFoundr email",
    `<p>Welcome to CoFoundr! Confirm your email:</p><p><a href="${link}">Verify email</a></p>`,
    link,
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${appUrl}/reset-password?token=${token}`;
  await send(
    to,
    "Reset your CoFoundr password",
    `<p>Reset your password:</p><p><a href="${link}">Choose a new password</a></p>`,
    link,
  );
}
