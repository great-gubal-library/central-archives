<template>
	<q-page class="page-link">
		<h2 class="regular-header-font">{{name}}</h2>
		Die folgenden Ergebnisse wurden gefunden:
		<ul v-if="nonImages">
			<li v-for="(result, index) in nonImages" :key="index">
				{{$display.pageTypes[result.type]}}: <router-link :to="getLink(result)">{{name}}</router-link>
			</li>
		</ul>
		<thumb-gallery v-if="images" :images="images" />
	</q-page>	
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { LinkResultDto } from '@app/shared/dto/links/link-result.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import { getPageLink } from 'src/common/pagelinks';
import ThumbGallery from 'src/components/images/ThumbGallery.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $router = useRouter();

function getLink(result: LinkResultDto): string {
	return getPageLink(result.type, result);
}

async function load(params: RouteParams): Promise<{ name: string, results: LinkResultDto[] }> {
	const unparsedName = (params.name as string || '').trim();

	if (!unparsedName) {
		void $router.replace('/');
		throw new Error();
	}

	const name = unparsedName.replace(/_/g, ' ');

	try {
		const results = await $api.links.resolve(name);

		if (results.length === 0) {
			// Nothing found
			notifyError('Page not found.');
			void $router.replace('/');
			return { name, results: [] };
		}
		
		if (results.length === 1) {
			// One page found; navigate to it
			void $router.push(getLink(results[0]));
			return { name, results: [] };
		}

		const profiles = results.filter(result => result.type === PageType.PROFILE);

		if (profiles.length === 1) {
			// One character profile found; navigate to it
			void $router.push(getLink(profiles[0]));
			return { name, results: [] };
		}

		// Several results found; display them
		return { name, results };
	} catch (e) {
		notifyError(e);
		throw e;
	}
}

@Options({
	name: 'PageLink',
	components: {
		ThumbGallery,
	},
	async beforeRouteEnter(to, _, next) {
		const { name, results } = await load(to.params);
		next(vm => (vm as PageLink).setContent(name, results));
	},
	async beforeRouteUpdate(to) {
		const { name, results } = await load(to.params);
		(this as PageLink).setContent(name, results);
	},
})
export default class PageLink extends Vue {
	name = '';
	nonImages: LinkResultDto[] = [];
	images: ImageSummaryDto[] = [];

	setContent(name: string, results: LinkResultDto[]) {
		this.name = name;
		this.nonImages = results.filter(result => result.type !== PageType.IMAGE);
		this.images = results.filter(result => result.type === PageType.IMAGE).map(result => result.image!);
	}

	getLink = getLink;
}
</script>

<style lang="scss">
</style>
