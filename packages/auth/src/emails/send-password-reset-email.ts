import { sendEmail } from '@yayago-app/mail';

export async function sendPasswordResetEmail(email: string, name: string, url: string) {
  const html = `
    <p>Hello ${name},</p>
    <p>You are receiving this email because you (or someone else) have requested a password reset for your YayaGO account.</p>
    <p>Please click the button below to reset your password:</p>
    <a href="${url}">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you!</p>
  `;

  const text = `
    Hello ${name},
    You are receiving this email because you (or someone else) have requested a password reset for your YayaGO account.
    Please click the button below to reset your password:
    ${url}
    If you did not request a password reset, please ignore this email.
    Thank you!
  `;

  return await sendEmail({
    to: {
      email,
      name,
    },
    from: {
      email: process.env.MAILJET_FROM_EMAIL || '',
    },
    subject: 'Reset Your Password - YayaGO',
    html,
    text,
  });
}
