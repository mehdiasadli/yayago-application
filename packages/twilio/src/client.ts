import createTwilio from 'twilio';

export const twilio = createTwilio(process.env.TWILIO_ACCOUNT_SID || '', process.env.TWILIO_AUTH_TOKEN || '');
