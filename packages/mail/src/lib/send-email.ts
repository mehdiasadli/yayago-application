import { mailjet } from '../client';
import type { SendEmailOptions, SendEmailResult } from './types';

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const From = opts.from;
  const To = Array.isArray(opts.to) ? opts.to : [opts.to];

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From,
          To,
          Subject: opts.subject,
          HTMLPart: opts.html,
          TextPart: opts.text,
        },
      ],
    });

    return { success: true, message: opts.successMessage || 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: opts.errorMessage || 'Failed to send email' };
  }
}
