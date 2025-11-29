export type EmailPerson = {
  email: string;
  name?: string;
};

export interface SendEmailOptions {
  to: EmailPerson | EmailPerson[];
  from: EmailPerson;
  subject: string;
  html: string;
  text?: string;
  successMessage?: string;
  errorMessage?: string;
}

export type SendEmailResult = {
  success: boolean;
  message: string;
};
