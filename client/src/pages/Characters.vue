<template>
  <q-page class="page-characters">
    <h2>People of the Realm</h2>
    <q-table
      class="page-characters__table"
      :columns="columns"
      :rows="profiles"
      :row-key="name"
      v-model:pagination="pagination"
			wrap-cells
      @row-click="onRowClick"
      @request="onPageRequest"
    >
      <template v-slot:top>
        <q-form class="page-characters__filter">
          <q-input
            class="page-characters__filter-search"
            v-model="searchQuery"
            label="Search"
						debounce="200"
            @update:model-value="refresh"
          />
          <label class="page-characters__filter-race">
            <span class="page-characters__race-label">Race:</span>
            <q-select
              class="page-characters__race-select"
              v-model="race"
              :display-value="$display.races[race]"
              emit-value
              map-options
              :options="raceOptions"
            	@update:model-value="refresh"
            />
          </label>
        </q-form>
      </template>
      <template v-slot:header-cell-avatar="props">
        <q-th :props="props" auto-width />
      </template>
      <template v-slot:body-cell-avatar="props">
        <q-td :props="props">
          <q-avatar round>
            <img :src="props.row.avatar" />
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <span class="page-characters__column-name">{{props.row.name}}</span>
					<template v-if="props.row.occupation">
						<br /><span class="page-characters__column-occupation">{{props.row.occupation}}</span>
					</template>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts">
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { CharacterProfileFilterDto } from '@app/shared/dto/characters/character-profile-filter.dto';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { Race } from '@app/shared/enums/race.enum';
import { useApi } from 'src/boot/axios';
import CharacterNameList from 'src/components/mainpage/CharacterNameList.vue';
import { Options, Vue } from 'vue-class-component';

const DEFAULT_ROWS_PER_PAGE = 20;
const $api = useApi();

@Options({
  components: {
    CharacterNameList,
  },
  async beforeRouteEnter(_, __, next) {
    const profiles = await $api.characters.getCharacterProfiles({
      limit: DEFAULT_ROWS_PER_PAGE,
    });
    next((vm) => (vm as PageCharacters).setContent(profiles));
  },
})
export default class PageCharacters extends Vue {
  profiles: CharacterSummaryDto[] = [];
  pagination = {
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
  };

  searchQuery = '';
  race: Race | null = null;

  get columns() {
    return [
      {
        name: 'avatar',
        field: 'avatar',
        label: '',
        align: 'left',
        sortable: false,
      },
      {
        name: 'name',
        field: 'name',
        label: 'Name',
        align: 'left',
        sortable: false,
      },
      {
        name: 'race',
        field: 'race',
        format: (val: Race) => this.$display.races[val],
        label: 'Race',
        align: 'left',
        classes: 'page-characters__column-race',
        sortable: false,
      },
    ];
  }

  get raceOptions() {
    return [
      { label: '(All)', value: null },
      ...Object.values(Race).map((race) => ({ value: race, label: this.$display.races[race] })),
    ];
  }

  setContent(profiles: PagingResultDto<CharacterSummaryDto>) {
    this.profiles = profiles.data;
    this.pagination.rowsNumber = profiles.total;
  }

  onRowClick(e: Event, profile: CharacterSummaryDto) {
    void this.$router.push(`/${profile.server}/${profile.name.replace(' ', '_')}`);
  }

	refresh() {
		void this.onPageRequest({ pagination: this.pagination });
	}

  async onPageRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
    const { page, rowsPerPage } = props.pagination;
    const filter: CharacterProfileFilterDto = {
      offset: (page - 1) * rowsPerPage,
      limit: rowsPerPage,
      searchQuery: this.searchQuery,
    };

    if (this.race) {
      filter.race = this.race;
    }

    const profiles = await this.$api.characters.getCharacterProfiles(filter);
    this.profiles = profiles.data;
    this.pagination.rowsNumber = profiles.total;
    this.pagination.rowsPerPage = rowsPerPage;
    this.pagination.page = page;
  }
}
</script>

<style lang="scss">
.page-characters__filter {
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
	flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.page-characters__filter-search {
  width: 300px;
}

.page-characters__filter-race {
  display: flex;
  align-items: center;
}

.page-characters__race-label {
  padding-right: 8px;
}

.page-characters__race-select {
  width: 110px;
}

.page-characters__table thead {
  background: #f0f0f0;
}

.page-characters__table th {
  font-family: $form-header-font;
}

.page-characters__table tbody tr:nth-child(even) {
  background: #f8f8f8;
}

.page-characters__column-name {
  font-size: $body-font-size;
}

.page-characters__column-race, .page-characters__column-occupation {
  color: #808080;
}
</style>
