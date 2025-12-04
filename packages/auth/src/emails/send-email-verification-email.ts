import { sendEmail } from '@yayago-app/mail';

export async function sendEmailVerificationEmail(email: string, name: string, url: string) {
  const html = `
  <p>Hello ${name},</p>
  <p>You are receiving this email because you (or someone else) have requested a email verification for your YayaGO account.</p>
  <p>Please click the button below to verify your email:</p>
  <a href="${url}">Verify Email</a>
  <p>If you did not request a email verification, please ignore this email.</p>
  <p>Thank you!</p>
  `;

  const text = `
  Hello ${name},
  You are receiving this email because you (or someone else) have requested a email verification for your YayaGO account.
  Please click the button below to verify your email:
  ${url}
  If you did not request a email verification, please ignore this email.
  Thank you!
  `;

  return await sendEmail({
    to: { email, name },
    from: { email: process.env.MAILJET_FROM_EMAIL || '' },
    subject: 'Verify Your Email - YayaGO',
    html,
    text,
  });
}
