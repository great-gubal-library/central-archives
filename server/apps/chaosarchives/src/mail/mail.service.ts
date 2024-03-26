import { mailConfiguration } from '@app/configuration/mail.config';
import SharedConstants from '@app/shared/shared-constants';
import { SiteRegion } from '@app/shared/enums/region.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserVerificationMail(region: SiteRegion, email: string, name: string, confirmLink: string): Promise<void> {
		return this.mailerService.sendMail({
      from: mailConfiguration.from[region],
			to: email,
			subject: 'Confirm your email',
			template: './confirm-email',
			context: {
        sitename: SharedConstants.regions[region].name,
				name,
				confirmLink,
			}
		});
	}

  async sendPasswordResetMail(region: SiteRegion, email: string, name: string, resetLink: string): Promise<void> {
		return this.mailerService.sendMail({
      from: mailConfiguration.from[region],
			to: email,
			subject: 'Your password reset link',
			template: './reset-password',
			context: {
        sitename: SharedConstants.regions[region].name,
				name,
				resetLink,
			}
		});
	}

  async sendNewEmailVerificationMail(region: SiteRegion, email: string, name: string, confirmLink: string): Promise<void> {
		return this.mailerService.sendMail({
      from: mailConfiguration.from[region],
			to: email,
			subject: 'Confirm your new email',
			template: './confirm-new-email',
			context: {
        sitename: SharedConstants.regions[region].name,
				name,
				confirmLink,
				newEmail: email,
			}
		});
	}
}
