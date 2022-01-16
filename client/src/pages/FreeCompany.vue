<template>
  <q-page class="page-free-company">
		<template v-if="fc && fc.id">
			<free-company-profile :free-company="fc" />
			<h3>Members</h3>
			<character-name-list :profiles="members.data" />
		</template>
		<template v-else-if="notFound">
			<h2>Free Company not found</h2>
			<p>The Free Company {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { FreeCompanyDto } from '@app/shared/dto/fcs/free-company.dto';
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import errors from '@app/shared/errors';
import FreeCompanyProfile from 'components/free-company/FreeCompanyProfile.vue';
import CharacterNameList from 'components/mainpage/CharacterNameList.vue';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import { notifyError } from 'src/common/notify';
import { useRouter } from 'src/router';

const $api = useApi();
const $router = useRouter();

interface Content {
	name: string;
	server: string;
	fc: FreeCompanyDto;
	members: PagingResultDto<CharacterSummaryDto>;
	notFound: boolean;
}

async function load(params: RouteParams): Promise<Content> {
		const server = params.server as string;
		let name = params.fc as string;

		if (!name || !server) {
			void $router.replace('/');
			throw new Error();
		}

		name = name.replace(/_/g, ' ');

		try {
			const fc = await $api.freeCompanies.getFreeCompany(name, server);

			return {
				name,
				server,
				fc,
				members: await $api.characters.getCharacterProfiles({ freeCompanyId: fc.id, limit: 99999 }),
				notFound: false
			}
		} catch (e) {
			if (errors.getStatusCode(e) === 404) {
				return {
					name,
					server,
					fc: new FreeCompanyDto(),
					members: { data: [], total: 0 },
					notFound: true
				}
			} else {
				notifyError(e);
				throw e;
			}
		}
}

@Options({
	components: {
		FreeCompanyProfile,
		CharacterNameList,
	},
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageFreeCompany).setContent(content));
	},
	async beforeRouteUpdate(to) {
		const content = await load(to.params);
		(this as PageFreeCompany).setContent(content);
	}
})
export default class PageFreeCompany extends Vue {
	name = '';
	server = '';
	fc: FreeCompanyDto = new FreeCompanyDto();
	members: PagingResultDto<CharacterSummaryDto> = { data: [], total: 0 };
	notFound = false;

	setContent(content: Content) {
		Object.assign(this, content);
	}
}
</script>

<style lang="scss">

</style>