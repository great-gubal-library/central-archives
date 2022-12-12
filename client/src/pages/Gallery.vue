<template>
  <q-page class="page-gallery">
    <h2>{{ title }}</h2>
    <div class="page-gallery__pagination">
      <div class="page-gallery__pagination-side">
        <q-input
          class="page-gallery__search-query"
          label="Search"
					debounce="200"
          :model-value="searchQuery"
          @update:model-value="setSearchQuery"
        />
      </div>
      <q-pagination :model-value="page" :max="maxPage" input @update:model-value="setPage" />
      <div class="page-gallery__pagination-side page-gallery__stats">{{ first }}–{{ last }} von {{ total }}</div>
    </div>
    <thumb-gallery :images="images" />
  </q-page>
</template>

<script lang="ts">
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { createMetaMixin } from 'quasar';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import ThumbGallery from 'src/components/images/ThumbGallery.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteLocationNormalized } from 'vue-router';

const $api = useApi();
const $router = useRouter();

interface PageData {
  category: ImageCategory;
  page: number;
  searchQuery: string;
  images: PagingResultDto<ImageSummaryDto>;
}

async function load(to: RouteLocationNormalized): Promise<PageData> {
  const category = to.params.category as ImageCategory;
  const page = Math.max(1, parseInt(to.query.page as string)) || 1;
  const searchQuery = (to.query.searchQuery as string) || '';

  if (!Object.values(ImageCategory).includes(category) || category == ImageCategory.UNLISTED) {
    void $router.replace('/');
    throw new Error();
  }

  try {
    return {
      category,
      searchQuery,
      page,
      images: await $api.images.getImages({
        category,
        searchQuery,
        offset: (page - 1) * SharedConstants.DEFAULT_ROWS_PER_PAGE,
        limit: SharedConstants.DEFAULT_ROWS_PER_PAGE,
      }),
    };
  } catch (e) {
    notifyError(e);
    throw e;
  }
}

@Options({
  name: 'PageGallery',
  components: {
    ThumbGallery,
  },
  async beforeRouteEnter(to, _, next) {
    const data = await load(to);
    next((vm) => (vm as PageGallery).setContent(data));
  },
  async beforeRouteUpdate(to) {
    const data = await load(to);
    (this as PageGallery).setContent(data);
  },
  mixins: [
    createMetaMixin(function (this: PageGallery) {
      return {
        title: `${this.title} — Chaos Archives`,
      };
    }),
  ],
})
export default class PageGallery extends Vue {
  category = ImageCategory.UNLISTED;
  images = [] as ImageSummaryDto[];
  total = 0;
  page = 1;
  searchQuery = '';

  setContent({ category, page, images, searchQuery }: PageData) {
    this.category = category;
    this.page = page;
    this.searchQuery = searchQuery;
    this.total = images.total;
    this.images = images.data;
    document.title = `${this.title} — Chaos Archives`;
  }

  get title() {
    return this.$display.imageCategories[this.category] + ' Galerie';
  }

  get maxPage() {
    return Math.max(1, Math.ceil(this.total / SharedConstants.DEFAULT_ROWS_PER_PAGE));
  }

  get first() {
    return (this.page - 1) * SharedConstants.DEFAULT_ROWS_PER_PAGE + 1;
  }

  get last() {
    return Math.max(this.first, this.first + this.images.length - 1);
  }

  setPage(newPage: number) {
    if (newPage >= 1 && newPage <= this.maxPage) {
      this.page = newPage;
      this.refresh();
    }
  }

  setSearchQuery(newSearchQuery: string) {
    this.searchQuery = newSearchQuery;
    this.refresh();
  }

  refresh() {
		const queryParams: { [ k: string] : string|number } = {
			page: this.page,
    };

		if (this.searchQuery) {
			queryParams.searchQuery = this.searchQuery;
		}

    void this.$router.replace({
      path: window.location.pathname,
      query: queryParams
		});
  }
}
</script>

<style lang="scss">
.page-gallery__pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page-gallery__pagination-side {
  flex-basis: 0;
  flex-grow: 1;
  text-align: right;
  white-space: nowrap;
}

.page-gallery__search-query {
	min-width: 200px;
	margin-right: 12px;
}

.page-gallery__stats {
	min-width: 100px;
}
</style>
