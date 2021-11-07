import { HttpStatus, ServiceUnavailableException, Logger } from '@nestjs/common';
import XIVAPI, { CharacterInfo } from '@xivapi/js';

const log = new Logger('getLodestoneCharacter');

export async function getLodestoneCharacter(
  lodestoneId: number,
): Promise<CharacterInfo | null> {
  try {
    const xivapi = new XIVAPI();
    return await xivapi.character.get(lodestoneId);
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
