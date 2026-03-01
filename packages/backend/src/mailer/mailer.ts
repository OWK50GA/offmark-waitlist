import dotenv from 'dotenv';
dotenv.config();

import { createTransport, Transporter, SendMailOptions } from "nodemailer";

interface MailOptions extends SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class Mailer {
  private transporter: Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const secure = process.env.SMTP_SECURE === 'true';

    if (!host) {
      throw new Error('SMTP_HOST is not defined in environment variables');
    }

    this.transporter = createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(options: MailOptions) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || '';
    if (!from) {
      throw new Error('SMTP_FROM or SMTP_USER must be defined to send emails');
    }

    const mailOptions: SendMailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}

// export a single instance that can be reused throughout the app
const mailer = new Mailer();
export default mailer;
export { Mailer, MailOptions };

