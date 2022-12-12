<template>
  <q-page class="page-stories">
    <h2>Geschichten</h2>
    <q-table
      class="page-stories__table striped-list paged-link-table"
      :columns="columns"
      :rows="stories"
      :row-key="name"
      v-model:pagination="pagination"
			wrap-cells
      @request="onPageRequest"
    >
      <template v-slot:top>
				<section class="page-stories__top">
					<q-form class="page-stories__filter">
						<q-input
							class="page-stories__filter-search"
							v-model="searchQuery"
							label="Suche"
							debounce="200"
							@update:model-value="refresh"
						/>
						<label class="page-stories__filter-type">
							<span class="page-stories__type-label">Typ:</span>
							<q-select
								class="page-stories__type-select"
								v-model="type"
								:display-value="$display.storyTypes[type]"
								emit-value
								map-options
								:options="typeOptions"
								@update:model-value="refresh"
							/>
						</label>
					</q-form>
					<label class="page-stories__filter-tag">
						<span class="page-stories__tag-label">Schlagworte:</span>
						<q-select
							class="page-stories__tag-select"
							v-model="tag"
							:display-value="tag"
							:options="tagOptions"
							use-input
							emit-value
							map-options
							@filter="onTagFilter"
							@update:model-value="refresh"
						/>
					</label>
				</section>
      </template>
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <router-link :to="getLink(props.row)">
            <span class="page-stories__column-title">{{props.row.title}}</span>
            <br /><span class="page-stories__column-author">{{props.row.author}}</span>
          </router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          <router-link :to="getLink(props.row)">
            <span class="page-stories__column-createdAt">{{$display.relativeTime(props.row.createdAt)}}</span>
          </router-link>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { StoryFilterDto } from '@app/shared/dto/stories/story-filter.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import { StoryType } from '@app/shared/enums/story-type.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();

@Options({
	name: 'PageStories',
  components: {

	},
  async beforeRouteEnter(to, _, next) {
		const tag = to.query.tag as string || '';
		const type = to.query.type as StoryType || null;
		const filter: StoryFilterDto = {
      limit: SharedConstants.DEFAULT_ROWS_PER_PAGE,
    };

		if (tag) {
			filter.tag = tag;
		}

		if (type) {
			filter.type = type;
		}

    const [ stories, tags] = await Promise.all([
			$api.stories.getStories(filter),
			$api.stories.getTags(),
		]);
    next((vm) => {
			(vm as PageStories).tag = tag;
			(vm as PageStories).type = type;
			(vm as PageStories).setContent(stories, tags);
		});
  },
})
export default class PageStories extends Vue {
  stories: StorySummaryDto[] = [];
  pagination = {
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
  };

  searchQuery = '';
  tag = '';
  type: StoryType|null = null;
	tagOptions: {label: string, value: string}[] = [];
	allTagOptions: {label: string, value: string}[] = [];

  get typeOptions() {
    return [
      { label: '(Alle)', value: null },
      ...Object.values(StoryType).map((type) => ({ value: type, label: this.$display.storyTypes[type] })),
    ];
  }

  get columns() {
    return [
      {
        name: 'title',
        field: 'title',
        label: 'Titel',
        align: 'left',
        sortable: false,
      },
      {
        name: 'createdAt',
        field: 'createdAt',
        format: (val: number) => this.$display.relativeTime(val),
        label: 'Verfasst',
        align: 'left',
        classes: 'page-stories__column-createdAt',
        sortable: false,
      },
    ];
  }

  setContent(stories: PagingResultDto<StorySummaryDto>, tags: string[]) {
		this.allTagOptions = [
			{
				label: '(Alle)',
				value: '',
			},
			...tags.map(tag => ({
				label: tag,
				value: tag
			}))
		];

    this.stories = stories.data;
    this.pagination.rowsNumber = stories.total;
  }

  getLink(story: StorySummaryDto) {
    return `/story/${story.id}`;
  }

	onTagFilter(value: string, update: () => void) {
    value = value.trim();

    if (!value) {
			this.tagOptions = this.allTagOptions;
    } else {
			this.tagOptions = [ this.allTagOptions[0], ...this.allTagOptions.filter(tag => tag.value.toLowerCase().includes(value.toLowerCase())) ];
		}

		update();
	}

	refresh() {
		void this.onPageRequest({ pagination: this.pagination });
	}

  async onPageRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
    const { page, rowsPerPage } = props.pagination;
    const filter: StoryFilterDto = {
      offset: (page - 1) * rowsPerPage,
      limit: rowsPerPage,
      searchQuery: this.searchQuery,
    };

    if (this.tag) {
      filter.tag = this.tag;
    }

    if (this.type) {
      filter.type = this.type;
    }

    const stories = await this.$api.stories.getStories(filter);
    this.stories = stories.data;
    this.pagination.rowsNumber = stories.total;
    this.pagination.rowsPerPage = rowsPerPage;
    this.pagination.page = page;
  }
}
</script>

<style lang="scss">
.page-stories__top {
	flex-grow: 1;
}

.page-stories__filter {
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
	flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.page-stories__filter-search {
  width: 300px;
}

.page-stories__filter-type {
  display: flex;
  align-items: center;
}

.page-stories__type-label, .page-stories__tag-label {
  padding-right: 8px;
}

.page-stories__type-select {
  width: 150px;
}

.page-stories__filter-tag {
	display: flex;
  align-items: center;
}

.page-stories__tag-select {
	flex-grow: 1;
}

.page-stories__column-title {
  font-size: $body-font-size;
}

.page-stories__column-author, .page-stories__column-createdAt {
  color: #808080;
}
</style>
