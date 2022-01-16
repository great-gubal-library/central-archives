<template>
  <q-list class="free-company-name-list striped-list" bordered>
    <q-item
      v-for="fc in freeCompanies"
      :key="`${fc.name}_${fc.server}`"
      clickable
      v-ripple
      :to="links ? getLink(fc) : null"
      @click="select(fc)"
    >
      <q-item-section side>
        <free-company-crest :images="fc.crest" />
      </q-item-section>
      <q-item-section>
          <q-item-label>{{fc.name}}</q-item-label>
          <q-item-label caption>{{fc.goal}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import FreeCompanyCrest from './FreeCompanyCrest.vue';
import { FreeCompanySummaryDto } from '@app/shared/dto/fcs/free-company-summary.dto';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
  freeCompanies = prop<FreeCompanySummaryDto[]>({
    required: true,
  });

  links = prop<boolean>({
    default: true,
  })
}

@Options({
  emits: [ 'select' ],
  components: {
    FreeCompanyCrest
  }
})
export default class FreeCompanyNameList extends Vue.with(Props) {
  getLink(fc: FreeCompanySummaryDto) {
    return `/fc/${fc.server}/${fc.name.replace(/ /g, '_')}`
  }

  select(profile: FreeCompanySummaryDto) {
    this.$emit('select', profile);
  }
}
</script>

<style lang="scss">
</style>
