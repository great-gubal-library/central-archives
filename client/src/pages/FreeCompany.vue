<template>
  <q-page class="page-free-company">
		<template v-if="fc && fc.id">
			<free-company-profile :free-company="fc" />
			<h3>Mitglieder</h3>
			<character-name-list :profiles="members.data" />
    	<report-violation-section :pageType="PageType.FREE_COMPANY" :pageId="fc.id" />
		</template>
		<template v-else-if="notFound">
			<h2>Freie Gesellschaft konnte nicht gefunden werden</h2>
			<p>Die Freie Gesellschaft {{name}} ({{server}}) ist nicht auf <strong>Elpisgarten</strong> vertreten.</p>
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
import { MetaOptions } from 'quasar/dist/types/meta';
import { createMetaMixin } from 'quasar';
import { PageType } from '@app/shared/enums/page-type.enum';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';

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
		ReportViolationSection,
	},
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageFreeCompany).setContent(content));
	},
	async beforeRouteUpdate(to) {
		const content = await load(to.params);
		(this as PageFreeCompany).setContent(content);
	},
	mixins: [
		createMetaMixin(function(this: PageFreeCompany) {
			const result: MetaOptions = {
				meta: {}
			};

			if (this.fc.banner) {
				Object.assign(result.meta, {
					ogImage: {
						property: 'og:image',
						content: this.fc.banner.url,
					},
					twitterCard: {
						property: 'twitter:card',
						content: 'summary_large_image',
					},
				});
			}

			return result;
		}),
	],
})
export default class PageFreeCompany extends Vue {
	readonly PageType = PageType;
	
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
