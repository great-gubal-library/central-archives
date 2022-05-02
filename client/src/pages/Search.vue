<template>
  <q-page class="page-search">
    <h2 class="regular-header-font">Search Results</h2>
    <template v-if="!isEmpty">
      <p>Search results for <strong>{{ query }}</strong>:</p>
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          align="justify"
          narrow-indicator
        >
          <template v-for="resultSet in results" :key="resultSet.type">
            <q-tab :name="resultSet.type" :label="$display.pageTypesPlural[resultSet.type]" />
          </template>
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab">
          <template v-for="resultSet in results" :key="resultSet.type">
            <q-tab-panel :name="resultSet.type">
              <dl>
                <template v-for="(result, index) in resultSet.results" :key="index">
                  <dt>
                    <router-link v-if="result.image" :to="getPageLink(resultSet.type, result)">
                      <img class="page-search__image gt-sm" :src="result.image.thumbUrl" :title="result.image.title" />
                    </router-link>
                    <router-link :to="getPageLink(resultSet.type, result)">{{ result.name }}</router-link>
                  </dt>
                  <dd v-html="formatResult(result.content)"></dd>
                </template>
              </dl>
            </q-tab-panel>
          </template>
         </q-tab-panels>
      </q-card>
    </template>
    <section v-else>
      Nothing found for <strong>{{ query }}</strong
      >.
    </section>
  </q-page>
</template>

<script lang="ts">
import { SearchResultsDto } from '@app/shared/dto/search/search-results.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
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

  const results = (await $api.search.search(searchQuery)).filter(resultSet => resultSet.results.length > 0);
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
  tab: PageType = PageType.PROFILE;

  private keywordsRegexps: RegExp[];

  setContent(query: string, results: SearchResultsDto[]) {
    this.query = query;
    this.keywords = toSearchKeywords(query);
    this.results = results;

    if (!this.isEmpty) {
      this.tab = this.results[0].type;
    }

    this.keywordsRegexps = this.keywords.map((keyword) => {
      const escapedKeyword = escapeStringRegexp(keyword);
      return new RegExp(
        `^(${escapedKeyword})$|^(${escapedKeyword})[^\\w]|[^\\w](${escapedKeyword})$|[^\\w](${escapedKeyword})[^\\w]`,
        'ig'
      );
    });
  }

  get isEmpty() {
    return this.results.length === 0;
  }

  formatResult(content: string): string {
    let result = parseWikilinksInHtml(content);

    for (const regexp of this.keywordsRegexps) {
      result = result.replace(regexp, (match: string, ...keywords: string[]) => {
        let replaced = match;

        for (const keyword of keywords.filter((keyword) => !!keyword)) {
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

.page-search dd::after {
  content: ' ';
  display: block;
  clear: both;
}

.page-search__image {
  float: left;
  width: 120px;
  height: 120px;
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
