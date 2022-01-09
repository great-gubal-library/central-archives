import { CharacterInfo, CharacterSearchEntry, FreeCompanyInfo, PagedResult } from '@xivapi/js';
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

		async get(id: number, options?: { extended: 0|1 }): Promise<CharacterInfo> {
			return (await axios.get<CharacterInfo>(`${XIVAPI_ROOT}/character/${id}`, {
				params: options
			})).data;
		}
  },
	freecompany: {
		async get(id: string, options?: { data: 'FCM' }): Promise<FreeCompanyInfo> {
			return (await axios.get<FreeCompanyInfo>(`${XIVAPI_ROOT}/freecompany/${id}`, {
				params: options
			})).data;
		}
	}
};

export default minXIVAPI;