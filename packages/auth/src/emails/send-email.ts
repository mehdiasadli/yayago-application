import { mailjet } from '../lib/mailjet';

interface SendEmailProps {
  to: {
    email: string;
    name?: string;
  };
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(props: SendEmailProps) {
  const From = {
    Email: props.from.email,
    Name: props.from.name || 'YayaGO',
  };

  const To = [
    {
      Email: props.to.email,
      Name: props.to.name || 'User',
    },
  ];

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From,
          To,
          Subject: props.subject,
          HTMLPart: props.html,
          TextPart: props.text,
        },
      ],
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to send email' };
  }
}
