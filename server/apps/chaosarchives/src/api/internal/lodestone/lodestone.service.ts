import { HttpStatus, ServiceUnavailableException, Logger, Injectable } from '@nestjs/common';
import {
  CharacterInfo,
  CharacterSearchEntry,
  FreeCompanyInfo,
  FreeCompanyMemberInfo,
  PagedResult,
} from '@app/shared/dto/lodestone';
import { Character, CharacterSearch, FCMembers, FreeCompany } from '@xivapi/nodestone';

@Injectable()
export class LodestoneService {
  private readonly logger = new Logger('LodestoneService');

  async searchCharacters(name: string, datacenter: string): Promise<PagedResult<CharacterSearchEntry>> {
    try {
      const parser = new CharacterSearch();
      const query = {
        name: `"${name}"`,
        dc: datacenter,
      };

      return (await parser.parse({ query } as any)) as PagedResult<CharacterSearchEntry>;
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(e.message, e.stack);
      } else {
        this.logger.error(e);
      }

      throw new ServiceUnavailableException('Unable to check character on Lodestone');
    }
  }

  async getCharacter(lodestoneId: number): Promise<CharacterInfo | null> {
    try {
      const parser = new Character();
      return (await parser.parse({ params: { characterId: lodestoneId.toString() } } as any)) as CharacterInfo;
    } catch (e) {
      // eslint-disable-next-line prefer-destructuring
      const statusCode: number | undefined = (e as any).statusCode;

      if (statusCode === HttpStatus.NOT_FOUND) {
        // Character not found on Lodestone
        return null;
      }

      if (e instanceof Error) {
        this.logger.error(e.message, e.stack);
      } else {
        this.logger.error(e);
      }

      throw new ServiceUnavailableException('Unable to check character on Lodestone');
    }
  }

  async getFreeCompany(lodestoneId: string): Promise<FreeCompanyInfo | null> {
    try {
      const fcParser = new FreeCompany();
      const fcResult = (await fcParser.parse({ params: { fcId: lodestoneId } } as any)) as FreeCompanyInfo;

      if (fcResult) {
        const membersParser = new FCMembers();
        const fcMembers = (await membersParser.parse({ params: { fcId: lodestoneId } } as any)) as {
          List: FreeCompanyMemberInfo[];
        };
        fcResult.Members = fcMembers.List;
      }

      return fcResult as FreeCompanyInfo;
    } catch (e) {
      // eslint-disable-next-line prefer-destructuring
      const statusCode: number | undefined = (e as any).statusCode;

      if (statusCode === HttpStatus.NOT_FOUND) {
        // Free Company not found on Lodestone
        return null;
      }

      if (e instanceof Error) {
        this.logger.error(e.message, e.stack);
      } else {
        this.logger.error(e);
      }

      throw new ServiceUnavailableException('Unable to check Free Company on Lodestone');
    }
  }
}
