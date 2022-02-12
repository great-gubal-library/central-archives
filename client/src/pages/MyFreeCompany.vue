<template>
  <q-page class="page-my-free-company">
    <h2>My Free Company</h2>
    <section>
      <div class="page-my-free-company__subtitle">for {{ $store.getters.character?.name }}</div>
      <section class="page-my-free-company__fc" v-if="freeCompany">
        <free-company-crest :images="freeCompany.crest" />
        <div class="page-my-free-company__fc-info">
          <p class="page-my-free-company__fc-name">
            <router-link :to="fcLink">{{ freeCompany.name }}</router-link>
            <template v-if="freeCompany.isLeader">
              — Leader <router-link :to="editFCLink">(Edit Free Company)</router-link>
            </template>
          </p>
          <p v-if="freeCompany.goal"><strong>Goal:</strong> {{ freeCompany.goal }}</p>
        </div>
      </section>
      <section v-else>
        <p>You are not listed a member of a Free Company.</p>
      </section>
      <p>
        <template v-if="freeCompany">
          <q-btn color="secondary" icon="remove" label="Unset Free Company" @click="onUnsetFCClick" />&nbsp;
        </template>
        <q-btn
          color="primary"
          icon="refresh"
          :label="freeCompany ? 'Update Free Company from Lodestone' : 'Set Free Company from Lodestone'"
          @click="onSetFCFromLodestoneClick"
        />
      </p>
      <q-inner-loading :showing="loading" />
    </section>
  </q-page>
</template>

<script lang="ts">
import { MyFreeCompanySummaryDto } from '@app/shared/dto/fcs/my-free-company-summary.dto';
import FreeCompanyCrest from 'components/free-company/FreeCompanyCrest.vue';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import minXIVAPI from 'src/common/xivapi-min';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $store = useStore();

@Options({
  name: 'PageMyFreeCompany',
  components: {
    FreeCompanyCrest,
  },
  async beforeRouteEnter(_, __, next) {
    try {
      const myFC = await $api.freeCompanies.getMyFreeCompany($store.getters.characterId!);
      next((vm) => (vm as PageMyFreeCompany).setContent(myFC));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  },
})
export default class PageMyFreeCompany extends Vue {
  freeCompany: MyFreeCompanySummaryDto|null = null;
  loading = false;

  get fcLink() {
    const fc = this.freeCompany;
    return fc == null ? null : `/fc/${fc.server}/${fc.name.replace(/ /g, '_')}`;
  }

  get editFCLink() {
    const fc = this.freeCompany;
    return fc == null ? null : `/edit-free-company/${fc.server}/${fc.name.replace(/ /g, '_')}`;
  }

  setContent(freeCompany: MyFreeCompanySummaryDto|null) {
    this.freeCompany = freeCompany;
  }

  async onSetFCFromLodestoneClick() {
    const lodestoneId = this.$store.getters.character!.lodestoneId;
    const characterInfo = await minXIVAPI.character.get(lodestoneId);
    const fcName = characterInfo.Character.FreeCompanyName!;

    let title;
    let message;
    let okTitle;

    if (characterInfo.Character.FreeCompanyName) {
      if (
        this.freeCompany &&
        characterInfo.Character.FreeCompanyName === this.freeCompany.name
      ) {
        title = 'Confirm Updating Free Company';
        message = `Update your Free Company "${fcName}" from Lodestone? This operation cannot be undone.`;
        okTitle = 'Update Free Company';
      } else {
        title = 'Confirm Setting Free Company';
        message = `Lodestone reports you are a member of ${fcName}. Set that as your Free Company?`;
        okTitle = 'Set Free Company';
      }
    } else {
      title = 'Confirm Unsetting Free Company';
      message = 'Lodestone reports you are not a member of any Free Company. Remove your Free Company association?';
      okTitle = 'Unset Free Company';
    }

    this.$q
      .dialog({
        title,
        message,
        ok: {
          label: okTitle,
          flat: true,
        },
        cancel: {
          label: 'Cancel',
          color: 'secondary',
          flat: true,
        },
      })
      .onOk(() => this.setFCFromLodestone());
  }

  async setFCFromLodestone() {
    this.loading = true;

    try {
      const oldName = this.freeCompany?.name;
      const fc = await this.$api.freeCompanies.setFCFromLodestone($store.getters.characterId!);
      this.freeCompany = fc;

      if (!fc) {
        notifySuccess('Free Company unset.');
      } else if (fc.name === oldName) {
        notifySuccess('Free Company updated.');
      } else {
        notifySuccess('Free Company set.');
      }
    } catch (e) {
      notifyError(e);
    } finally {
      this.loading = false;
    }
  }

  onUnsetFCClick() {
    const fcName = this.freeCompany!.name;

    this.$q
      .dialog({
        title: 'Confirm Unsetting Free Company',
        message: `Do you want to remove your association with ${fcName}?`,
        ok: {
          label: 'Unset Free Company',
          color: 'negative',
          flat: true,
        },
        cancel: {
          label: 'Cancel',
          color: 'secondary',
          flat: true,
        },
      })
      .onOk(() => this.unsetFC());
  }

  async unsetFC() {
    this.loading = true;

    try {
      await this.$api.freeCompanies.unsetFC($store.getters.characterId!);
      this.freeCompany = null;

      notifySuccess('Free Company unset.');
    } catch (e) {
      notifyError(e);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss">
.page-my-free-company h2 {
  margin-bottom: 0;
}

.page-my-free-company__fc {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.page-my-free-company__fc-info {
  padding-left: 12px;
}

.page-my-free-company__fc-name {
  font-size: 1.2em;
  font-weight: bold;
}

.page-my-free-company__subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
  margin-bottom: 24px;
}
</style>
