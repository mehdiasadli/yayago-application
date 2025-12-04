import { sendWpMsg } from '@yayago-app/twilio';

export async function sendPhoneVerificationMsg(phoneNumber: string, code: string) {
  await sendWpMsg({
    to: phoneNumber,
    message: `Hello, your verification code is ${code}. Please use this code to verify your phone number. YayaGo.`,
  });
}
