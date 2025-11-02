import { EventEmitter } from 'events';
import Mail from 'nodemailer/lib/mailer';
import { verifyEmailTemplate } from '../email/template.email';
import { sendEmail } from './send.email';
import { OtpEnum } from 'src/common';

export interface IEmail extends Mail.Options {
  otp: string;
}

export const emailEmitter = new EventEmitter();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
emailEmitter.on(OtpEnum.confirmEmail, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.confirmEmail;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
emailEmitter.on(OtpEnum.resetPassword, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.resetPassword;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});
