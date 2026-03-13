import dotenv from 'dotenv';
import { Resend } from 'resend';
dotenv.config();

// import { createTransport, Transporter, SendMailOptions } from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class Mailer {
  private resend: Resend;
  private from: string;
  private apiKey: string;
  private template_id: string;
  
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const template_id = process.env.RESEND_EMAIL_ONBOARDING_TEMPLATE
    if (!apiKey || !template_id) {
      throw new Error("Resend Variables not set");
    }
    this.apiKey = apiKey;
    this.template_id = template_id;
    this.resend = new Resend(this.apiKey);
    this.from = "offmarkltd@gmail.com"
  }
  
  async sendMail(options: MailOptions) {
    // return this.transporter.sendMail(mailOptions);
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: [options.to],
      // subject: options.subject,
      // html: options.html,
      template: {
        id: this.template_id,
        variables: {
          first_name: "Phoenix"
        }
      }
    })

    if (error) {
      console.log("Error sending email: ", error);
    }

    console.log("Email sent successfully to ", options.to)
  }
}

// // export a single instance that can be reused throughout the app
const mailer = new Mailer();
export default mailer;
export { Mailer, MailOptions };


