import { UserInfo } from '@app/authorization/model/user-info';
import { HsspRequestDto } from '@app/shared/dto/hssp/hssp-request.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { promises } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

interface Context {
  accessToken: string;
  currentCharacterId: string | null;
  redirectPath: string;
}

const handlebarsEnv = Handlebars.create();

handlebarsEnv.registerHelper('literal', (arg: string|number) => {
  return JSON.stringify(arg.toString()).replace(/\\n/g, "\\n");
});

@Injectable()
export class HsspService {
  private template: HandlebarsTemplateDelegate<Context>;

  async redirect(request: HsspRequestDto, user: UserInfo): Promise<string> {
    if (request.currentCharacterId && !user.characters.map(ch => ch.id).includes(request.currentCharacterId)) {
      throw new BadRequestException('Invalid character ID');
    }

    const template = await this.getTemplate();
    return template({
      accessToken: '__q_strn|' + request.accessToken,
      currentCharacterId: request.currentCharacterId ? '__q_numb|' + request.currentCharacterId : null,
      redirectPath: request.redirectPath,
    });
  }

  private async getTemplate(): Promise<HandlebarsTemplateDelegate<Context>> {
    if (this.template) {
      return this.template;
    }

    const fileContents = await promises.readFile(join(__dirname, 'templates', 'hssp.hbs'), { encoding: 'utf-8' });
    this.template = handlebarsEnv.compile(fileContents);
    return this.template;
  }
}
