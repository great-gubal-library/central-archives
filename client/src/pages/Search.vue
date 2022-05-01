<template>
  <q-page class="page-search">
    <h2 class="regular-header-font">Search Results</h2>
    <template v-if="!isEmpty">
      Search results for <strong>{{ query }}</strong
      >:
      <section v-for="resultSet in results" :key="resultSet.type">
        <template v-if="resultSet.results.length > 0">
          <h3>{{ $display.pageTypes[resultSet.type] }}</h3>
          <dl>
            <template v-for="(result, index) in resultSet.results" :key="index">
              <dt>
                <router-link :to="getPageLink(resultSet.type, result)">{{ result.name }}</router-link>
              </dt>
              <dd v-html="formatResult(result.content)"></dd>
            </template>
          </dl>
        </template>
      </section>
    </template>
    <section v-else>
      Nothing found for <strong>{{ query }}</strong
      >.
    </section>
  </q-page>
</template>

<script lang="ts">
import { SearchResultsDto } from '@app/shared/dto/search/search-results.dto';
import { escapeStringRegexp, toSearchKeywords } from '@app/shared/search-utils';
import { useApi } from 'src/boot/axios';
import { getPageLink } from 'src/common/pagelinks';
import { parseWikilinksInHtml } from 'src/common/wikilinks';
import ThumbGallery from 'src/components/images/ThumbGallery.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteLocationNormalized } from 'vue-router';

const $api = useApi();
const $router = useRouter();

async function load(to: RouteLocationNormalized): Promise<{ query: string; results: SearchResultsDto[] }> {
  const searchQuery = ((to.query.q as string) || '').trim();

  if (!searchQuery) {
    void $router.replace('/');
    throw new Error();
  }

  const results = await $api.search.search(searchQuery);
  return { query: searchQuery, results };
}

@Options({
  name: 'PageSearch',
  components: {
    ThumbGallery,
  },
  async beforeRouteEnter(to, _, next) {
    const { query, results } = await load(to);
    next((vm) => (vm as PageSearch).setContent(query, results));
  },
  async beforeRouteUpdate(to) {
    const { query, results } = await load(to);
    (this as PageSearch).setContent(query, results);
  },
})
export default class PageSearch extends Vue {
  query = '';
  keywords: string[] = [];
  results: SearchResultsDto[] = [];

  private keywordsRegexps: RegExp[];

  setContent(query: string, results: SearchResultsDto[]) {
    this.query = query;
    this.keywords = toSearchKeywords(query);
    this.results = results;

    this.keywordsRegexps = this.keywords
      .map((keyword) => {
        const escapedKeyword = escapeStringRegexp(keyword);
        return new RegExp(`^(${escapedKeyword})$|^(${escapedKeyword})[^\\w]|[^\\w](${escapedKeyword})$|[^\\w](${escapedKeyword})[^\\w]`, 'ig');
      });
  }

  get isEmpty() {
    for (const resultSet of this.results) {
      if (resultSet.results.length > 0) {
        return false;
      }
    }

    return true;
  }

  formatResult(content: string): string {
    let result = parseWikilinksInHtml(content);

		for (const regexp of this.keywordsRegexps) {
			result = result.replace(regexp, (match: string, ...keywords: string[]) => {
				let replaced = match;

				for (const keyword of keywords.filter(keyword => !!keyword)) {
					replaced = replaced.replace(keyword, `<strong>${keyword}</strong>`);
				}

				return replaced;
			});
		}

		return result;
  }

  getPageLink = getPageLink;

  parseWikilinksInHtml = parseWikilinksInHtml;
}
</script>

<style lang="scss">
.page-search dt {
	font-size: 1.2em;
}

.page-search dd {
	margin-bottom: 8px;
}
</style>
