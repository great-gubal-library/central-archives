import { mailConfiguration } from '@app/configuration/mail.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailService } from './mail.service';


@Module({
	imports: [
    MailerModule.forRootAsync({ useFactory: () => ({
      transport: {
        host: mailConfiguration.host,
				port: mailConfiguration.port,
        secure: mailConfiguration.secure,
        auth: {
          user: mailConfiguration.username,
          pass: mailConfiguration.password,
        },
      },
      defaults: {
        from: mailConfiguration.from,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }) }),
  ],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
