<template>
  <q-page class="page-free-company">
		<free-company-profile v-if="fc && fc.id" :free-company="fc" />
		<template v-else-if="notFound">
			<h2>Free Company not found</h2>
			<p>The Free Company {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { FreeCompanyDto } from '@app/shared/dto/fcs/free-company.dto';
import errors from '@app/shared/errors';
import FreeCompanyProfile from 'components/free-company/FreeCompanyProfile.vue';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

interface Content {
	name: string;
	server: string;
	freeCompany: FreeCompanyDto;
	// content: CharacterContentDto;
	notFound: boolean;
}

async function load(params: RouteParams): Promise<Content> {
		const server = params.server as string;
		let name = params.fc as string;

		if (!name || !server) {
			void $router.replace('/');
			throw new Error();
		}

		name = name.replace('_', ' ');

		try {
			const fc = await $api.freeCompanies.getFreeCompany(name, server);

			return {
				name,
				server,
				fc,
				// content: await $api.characters.getCharacterContent(fc.id),
				notFound: false
			}
		} catch (e) {
			if (errors.getStatusCode(e) === 404) {
				return {
					name,
					server,
					fc: new FreeCompanyDto(),
					// content: { stories: [], images: [] },
					notFound: true
				}
			} else {
				$q.notify({
					type: 'negative',
					message: errors.getMessage(e)
				});
				throw e;
			}
		}
}

@Options({
	components: {
		FreeCompanyProfile,
	},
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageCharacter).setContent(content));
	},
	async beforeRouteUpdate(to) {
		const content = await load(to.params);
		(this as PageCharacter).setContent(content);
	}
})
export default class PageFreeCompany extends Vue {
	name = '';
	server = '';
	fc: FreeCompanyDto = new FreeCompanyDto();
	// content: CharacterContentDto = { stories: [], images: [] };
	notFound = false;

	setContent(content: Content) {
		Object.assign(this, content);
	}
}
</script>

<style lang="scss">

</style>