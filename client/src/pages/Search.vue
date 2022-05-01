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

  private keywordsRegexp: RegExp;

  setContent(query: string, results: SearchResultsDto[]) {
    this.query = query;
    this.keywords = toSearchKeywords(query);
    this.results = results;

    const keywordsRegexpStr = this.keywords
      .map((keyword) => {
        const escapedKeyword = escapeStringRegexp(keyword);
        return `^(${escapedKeyword})$|^(${escapedKeyword})[^\\w]|[^\\w](${escapedKeyword})$|[^\\w](${escapedKeyword})[^\\w]`;
      })
      .join('|');
    this.keywordsRegexp = new RegExp(keywordsRegexpStr, 'g');
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
    const wikifiedContent = parseWikilinksInHtml(content);
    return wikifiedContent.replace(this.keywordsRegexp, (match: string, ...keywords: string[]) => {
			const keyword = keywords.find(keyword => !!keyword);

			if (!keyword) {
				return match;
			}

			return match.replace(keyword, `<strong>${keyword}</strong>`);
		});
  }

  getPageLink = getPageLink;

  parseWikilinksInHtml = parseWikilinksInHtml;
}
</script>

<style lang="scss"></style>
