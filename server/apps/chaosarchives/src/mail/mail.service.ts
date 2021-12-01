import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserVerificationMail(email: string, name: string, confirmLink: string): Promise<void> {
		return this.mailerService.sendMail({
			to: email,
			subject: 'Confirm your email',
			template: './confirm-email',
			context: {
				name,
				confirmLink
			}
		});
	}

  async sendPasswordResetMail(email: string, name: string, resetLink: string): Promise<void> {
		return this.mailerService.sendMail({
			to: email,
			subject: 'Your password reset link',
			template: './reset-password',
			context: {
				name,
				resetLink
			}
		});
	}

  async sendNewEmailVerificationMail(email: string, name: string, confirmLink: string): Promise<void> {
		return this.mailerService.sendMail({
			to: email,
			subject: 'Confirm your new email',
			template: './confirm-new-email',
			context: {
				name,
				confirmLink,
				newEmail: email
			}
		});
	}
}
