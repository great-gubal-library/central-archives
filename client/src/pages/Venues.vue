<template>
  <q-page class="page-venues">
    <h2>Venues</h2>
    <q-table
      class="page-venues__table striped-list paged-link-table"
      :columns="columns"
      :rows="venues"
      row-key="name"
      v-model:pagination="pagination"
			wrap-cells
      @request="onPageRequest"
    >
      <template v-slot:top>
        <q-form class="page-venues__filter">
          <q-input
            class="page-venues__filter-search"
            v-model="searchQuery"
            label="Search"
						debounce="200"
            @update:model-value="refresh"
          />
          <label class="page-venues__filter-housingArea">
            <span class="page-venues__housing-area-label">Housing area:</span>
            <q-select
              class="page-venues__housing-area-select"
              v-model="housingArea"
              :display-value="$display.housingAreas[housingArea]"
              emit-value
              map-options
              :options="housingAreaOptions"
            	@update:model-value="refresh"
            />
          </label>
        </q-form>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <router-link :to="getLink(props.row)">
            <span class="page-venues__column-name">{{props.row.name}}</span>
            <template v-if="props.row.purpose">
              <br /><span class="page-venues__column-purpose">{{props.row.purpose}}</span>
            </template>
          </router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-housingArea="props">
        <q-td :props="props">
          <router-link :to="getLink(props.row)">
            <span class="page-venues__column-housingArea">{{$display.housingAreas[props.row.housingArea]}}</span>
          </router-link>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { VenueFilterDto } from '@app/shared/dto/venues/venue-filter.dto';
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { HousingArea } from '@app/shared/enums/housing-area.enum';
import SharedConstants from '@app/shared/shared-constants';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();

@Options({
  name: 'PageVenues',
  components: {
  },
  async beforeRouteEnter(to, __, next) {
    const searchQuery = to.query.searchQuery as string || '';
    const housingArea = to.query.housingArea && Object.values(HousingArea).includes(to.query.housingArea as HousingArea) ? to.query.housingArea as HousingArea : null;
    const page = parseInt(to.query.page as string, 10) || 1;
    const rowsPerPage = parseInt(to.query.rowsPerPage as string, 10) || SharedConstants.DEFAULT_ROWS_PER_PAGE;

    const filter: VenueFilterDto = {
      offset: (page - 1) * rowsPerPage,
      limit: SharedConstants.DEFAULT_ROWS_PER_PAGE,
      searchQuery,
    };

    if (housingArea) {
      filter.housingArea = housingArea;
    }

    const venues = await $api.venues.getVenues(filter);
    next((vm) => (vm as PageVenues).setContent(venues, searchQuery, housingArea, { page, rowsPerPage }));
  },
})
export default class PageVenues extends Vue {
  venues: VenueSummaryDto[] = [];
  pagination = {
    page: 1,
    rowsPerPage: SharedConstants.DEFAULT_ROWS_PER_PAGE as number,
    rowsNumber: 0,
  };

  searchQuery = '';
  housingArea: HousingArea | null = null;

  get columns() {
    return [
      {
        name: 'name',
        field: 'name',
        label: 'Name',
        align: 'left',
        sortable: false,
      },
      {
        name: 'housingArea',
        field: 'housingArea',
        format: (val: HousingArea) => this.$display.housingAreas[val],
        label: 'Housing Area',
        align: 'left',
        sortable: false,
      },
    ];
  }

  get housingAreaOptions() {
    return [
      { label: '(All)', value: null },
      ...Object.values(HousingArea).map((housingArea) => ({ value: housingArea, label: this.$display.housingAreas[housingArea] })),
    ];
  }

  setContent(venues: PagingResultDto<VenueSummaryDto>, searchQuery: string, housingArea: HousingArea | null,
      pagination: { page: number; rowsPerPage: number }) {
    this.venues = venues.data;
    this.searchQuery = searchQuery;
    this.housingArea = housingArea;
    this.pagination.page = pagination.page;
    this.pagination.rowsPerPage = pagination.rowsPerPage;
    this.pagination.rowsNumber = venues.total;
  }

  getLink(venue: VenueSummaryDto) {
    return `/venue/${venue.server}/${venue.name.replace(/ /g, '_')}`;
  }

	refresh() {
		void this.onPageRequest({ pagination: this.pagination });
	}

  async onPageRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
    const { page, rowsPerPage } = props.pagination;
    const filter: VenueFilterDto = {
      offset: (page - 1) * rowsPerPage,
      limit: rowsPerPage,
      searchQuery: this.searchQuery,
    };

    if (this.housingArea) {
      filter.housingArea = this.housingArea;
    }

    const venues = await this.$api.venues.getVenues(filter);
    this.venues = venues.data;
    this.pagination.rowsNumber = venues.total;
    this.pagination.rowsPerPage = rowsPerPage;
    this.pagination.page = page;

    const queryParams: { [ k: string] : string|number } = {
      page: this.pagination.page,
      rowsPerPage: this.pagination.rowsPerPage
    };

    if (this.searchQuery) {
      queryParams.searchQuery = this.searchQuery;
    }

    if (this.housingArea) {
      queryParams.housingArea = this.housingArea;
    }

    void this.$router.replace({
      path: '/venues',
      query: queryParams,
    })
  }
}
</script>

<style lang="scss">
.page-venues__filter {
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
	flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.page-venues__filter-search {
  width: 300px;
}

.page-venues__filter-housingArea {
  display: flex;
  align-items: center;
}

.page-venues__housing-area-label {
  padding-right: 8px;
}

.page-venues__housing-area-select {
  width: 110px;
}

.page-venues__column-name {
  font-size: $body-font-size;
}

.page-venues th {
  white-space: nowrap;
}

.page-venues__column-housingArea, .page-venues__column-purpose {
  color: #808080;
}
</style>
