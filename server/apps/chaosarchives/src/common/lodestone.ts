import { HttpStatus, ServiceUnavailableException, Logger } from '@nestjs/common';
import { CharacterInfo, FreeCompanyInfo, FreeCompanyMemberInfo } from '@app/shared/dto/lodestone';
import { Character, FCMembers, FreeCompany } from '@xivapi/nodestone';

const log = new Logger('getLodestoneCharacter');

export async function getLodestoneCharacter(
  lodestoneId: number,
): Promise<CharacterInfo | null> {
  try {
    const parser = new Character();
    return await parser.parse({ params: { characterId: lodestoneId.toString() } } as any) as CharacterInfo;
  } catch (e) {
    // eslint-disable-next-line prefer-destructuring
    const statusCode: number | undefined = (e as any).statusCode;

    if (statusCode === HttpStatus.NOT_FOUND) {
      // Character not found on Lodestone
      return null;
    }

    log.error(e);

    throw new ServiceUnavailableException(
      'Unable to check character on Lodestone',
    );
  }
}

export async function getLodestoneFreeCompany(
  lodestoneId: string,
): Promise<FreeCompanyInfo | null> {
  try {
    const fcParser = new FreeCompany();
    const fcResult = await fcParser.parse({ params: { fcId: lodestoneId } } as any) as FreeCompanyInfo;

    if (fcResult) {
      const membersParser = new FCMembers();
      const fcMembers = await membersParser.parse({ params: { fcId: lodestoneId } } as any) as {
        List: FreeCompanyMemberInfo[];
      };
      fcResult.Members = fcMembers.List;
    }

    log.debug(fcResult);
    return fcResult as FreeCompanyInfo;
  } catch (e) {
    // eslint-disable-next-line prefer-destructuring
    const statusCode: number | undefined = (e as any).statusCode;

    if (statusCode === HttpStatus.NOT_FOUND) {
      // Free Company not found on Lodestone
      return null;
    }

    log.error(e);

    throw new ServiceUnavailableException(
      'Unable to check Free Company on Lodestone',
    );
  }
}
