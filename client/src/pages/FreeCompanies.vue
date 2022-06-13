<template>
  <q-page class="page-free-companies">
		<h2>Free Companies</h2>
		<free-company-name-list v-if="freeCompanies.length > 0" :free-companies="freeCompanies" />
		<div v-else>There are no claimed Free Companies... yet!</div>
	</q-page>	
</template>

<script lang="ts">
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from '@common/common/notify';
import FreeCompanyNameList from 'src/components/free-company/FreeCompanyNameList.vue';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();

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
      notifyError(e);
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