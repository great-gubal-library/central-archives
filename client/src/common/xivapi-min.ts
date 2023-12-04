import { CharacterSearchEntry, PagedResult } from '@app/shared/dto/lodestone';
import axios from 'axios';

const XIVAPI_ROOT = 'https://xivapi.com';

const minXIVAPI = {
  character: {
    async search(
      name: string,
      options?: { server: string }
    ): Promise<PagedResult<CharacterSearchEntry>> {
			const params: { name: string, server?: string } = {
				name
			};

			if (options) {
				params.server = options.server;
			}

			return (await axios.get<PagedResult<CharacterSearchEntry>>(`${XIVAPI_ROOT}/character/search`, {
				params
			})).data;
		},
  },
};

export default minXIVAPI;
