<template>
  <q-page class="page-my-free-company">
    <h2>Meine Freie Gesellschaft</h2>
    <section>
      <div class="page-my-free-company__subtitle">von {{ $store.getters.character?.name }}</div>
      <section class="page-my-free-company__fc" v-if="freeCompany">
        <free-company-crest :images="freeCompany.crest" />
        <div class="page-my-free-company__fc-info">
          <p class="page-my-free-company__fc-name">
            <router-link :to="fcLink">{{ freeCompany.name }}</router-link>
            <template v-if="freeCompany.isLeader">
              — Leader <router-link :to="editFCLink">(Bearbeiten)</router-link>
            </template>
          </p>
          <p v-if="freeCompany.goal"><strong>Ziel:</strong> {{ freeCompany.goal }}</p>
        </div>
      </section>
      <section v-else>
        <p>Du bist noch kein Mitglied einer Freien Gesellschaft.</p>
      </section>
      <p>
        <template v-if="freeCompany">
          <q-btn color="secondary" icon="remove" label="Freie Gesellschaft entfernen" @click="onUnsetFCClick" />&nbsp;
        </template>
        <q-btn
          color="primary"
          icon="refresh"
          :label="freeCompany ? 'Freie Gesellschaft via Lodestone aktualisieren' : 'Freie Gesellschaft via Lodestone hinzufügen'"
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
        title = 'Bestätige Aktualisierung';
        message = `Deine Freie Gesellschaft "${fcName}" via Lodestone aktualisieren? Dieser Vorgang kann nicht rückgängig gemacht werden.`;
        okTitle = 'Aktualisieren';
      } else {
        title = 'Bestätige Hinzufügung';
        message = `Lodestone meldet, dass du ein Mitglied von ${fcName} bist. Diese Freie Gesellschaft hinzufügen?`;
        okTitle = 'Hinzufügen';
      }
    } else {
      title = 'Bestätige Entfernung';
      message = 'Lodestone meldet, dass du kein Mitglied einer Freien Gesellschaft bist. Die Assoziation der Freien Gesellschaft entfernen?';
      okTitle = 'Entfernen';
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
        notifySuccess('Freie Gesellschaft entfernt.');
      } else if (fc.name === oldName) {
        notifySuccess('Freie Gesellschaft aktualisiert.');
      } else {
        notifySuccess('Freie Gesellschaft hinzugefügt.');
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
        title: 'Entfernung der Freien Gesellschaft',
        message: `Möchtest du deine Assoziation mit ${fcName} entfernen?`,
        ok: {
          label: 'Entfernen',
          color: 'negative',
          flat: true,
        },
        cancel: {
          label: 'Abbrechen',
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

      notifySuccess('Freie Gesellschaft entfernt.');
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
