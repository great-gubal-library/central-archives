<template>
  <q-page class="page-free-companies">
		<h2>Free Companies</h2>
		<free-company-name-list v-if="freeCompanies.length > 0" :free-companies="freeCompanies" />
		<div v-else>There are no claimed Free Companies... yet!</div>
	</q-page>	
</template>

<script lang="ts">
import errors from '@app/shared/errors';
import FreeCompanyNameList from 'src/components/free-company/FreeCompanyNameList.vue';
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $q = useQuasar();

@Options({
	name: 'PageFreeCompanies',
	components: {
		FreeCompanyNameList
	},
  async beforeRouteEnter(_, __, next) {
    try {
      const freeCompanies = await $api.freeCompanies.getFreeCompanies();
      next(vm => (vm as PageFreeCompanies).setContent(freeCompanies));
    } catch (e) {
      console.log(e);
      $q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
    }
  }
})
export default class PageFreeCompanies extends Vue {
	freeCompanies: FreeCompanySummaryDto[] = [];

	setContent(freeCompanies: FreeCompanySummaryDto[]) {
		this.freeCompanies = freeCompanies;
	}
}
</script>

<style lang="scss">

</style>