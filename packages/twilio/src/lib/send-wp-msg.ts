import { twilio } from '../client';
import type { SendWpMsgOptions } from './types';

export async function sendWpMsg(opts: SendWpMsgOptions) {
  try {
    const from = opts.from || process.env.TWILIO_FROM_NUMBER;

    if (!from) {
      throw new Error('TWILIO_FROM_NUMBER is not set in the environment variables');
    }

    const result = await twilio.messages.create({
      body: opts.message,
      to: `whatsapp:${opts.to}`,
      from: `whatsapp:${from}`,
    });

    console.log(`WhatsApp message sent to ${opts.to}: ${result.sid}`);
    console.log(`Whatsapp message status: ${result.status}`);
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${opts.to}: ${error}`);
    throw error;
  }
}
