import { EventEmitter } from 'events';
import Mail from 'nodemailer/lib/mailer';
import { verifyEmailTemplate } from '../email/template.email';
import { sendEmail } from './send.email';
import { OtpEnum } from 'src/common/enums/otp.enum';

export interface IEmail extends Mail.Options {
  otp: string;
}

export const emailEmitter = new EventEmitter();

emailEmitter.on(OtpEnum.confirmEmail, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.confirmEmail;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});


emailEmitter.on(OtpEnum.resetPassword, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.resetPassword;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});
