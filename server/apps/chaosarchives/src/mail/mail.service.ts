import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserVerificationMail(email: string, confirmLink: string): Promise<void> {
		return this.mailerService.sendMail({
			to: email,
			subject: 'Confirm your email',
			template: './confirm-email',
			context: {
				email,
				confirmLink
			}
		});
	}
}
