import mailer, { Mailer } from '../../src/mailer/mailer';
import * as nodemailer from 'nodemailer';

// Provide our own mock implementation for createTransport
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('Mailer class', () => {
  const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
  const mockCreateTransport = nodemailer.createTransport as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });

    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '2525';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password';
    process.env.SMTP_FROM = 'no-reply@example.com';
  });

  it('constructs transporter with correct configuration', () => {
    // require a new instance to trigger constructor logic
    const instance = new Mailer();

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 2525,
      secure: false,
      auth: {
        user: 'user@example.com',
        pass: 'password',
      },
    });

    // make sure the exported singleton is also available
    expect(mailer).toBeDefined();
  });

  it('sendMail forwards options to transport.sendMail', async () => {
    const instance = new Mailer();

    await instance.sendMail({
      to: 'recipient@foo.com',
      subject: 'Test',
      text: 'Hello',
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'no-reply@example.com',
      to: 'recipient@foo.com',
      subject: 'Test',
      text: 'Hello',
      html: undefined,
    });
  });

  it('throws if SMTP_HOST is missing', () => {
    delete process.env.SMTP_HOST;
    expect(() => new Mailer()).toThrow('SMTP_HOST is not defined');
  });

  it('throws if from address cannot be determined', async () => {
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_USER;
    const instance = new Mailer();
    await expect(instance.sendMail({ to: 'a@b.com', subject: 'x' })).rejects.toThrow(
      'SMTP_FROM or SMTP_USER must be defined'
    );
  });
});
