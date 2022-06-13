<template>
  <q-page class="page-edit-free-company">
    <template v-if="fc.id">
      <h2>Edit Free Company</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <div class="page-edit-free-company__lodestone-info">
            <section class="page-edit-free-company__form-controls">
              <q-input :model-value="fc.name" label="Name" readonly />
              <q-input :model-value="fc.tag" label="Tag" readonly />
            </section>
          </div>
          <banner-edit-section v-model="fc.banner" />
          <section class="page-edit-free-company__form-controls">
            <q-input v-model="fc.website" label="Website" />
            <q-input v-model="fc.goal" label="Goal" />
            <q-input v-model="fc.status" label="Status" />
            <q-input v-model="fc.areaOfOperations" label="Main area of operations" />
            <q-input v-model="fc.recruitingOfficers" label="Recruiting officers" />
            <div class="text-caption">You can use [[wikilinks]], e.g. [[Character Name]], in all fields except website.</div>
          </section>
          <h6>Description</h6>
          <html-editor v-model="fc.description" />
          <carrd-edit-section
            class="page-edit-free-company__form-controls"
            entity-type="Free Company"
            v-model="fc.carrdProfile"
          />
        </template>
        <section v-else class="page-edit-free-company__preview">
          <free-company-profile :free-company="fc" :preview="true" />
        </section>
        <div class="page-edit-free-company__button-bar">
          <q-btn-toggle v-model="preview" :options="previewOptions" toggle-color="secondary" />
          <div class="page-edit-free-company__revert-submit">
            <q-btn label="Revert" color="secondary" @click="onRevertClick" />&nbsp;
            <q-btn label="Save changes" type="submit" color="primary" />
          </div>
        </div>
        <q-inner-loading :showing="saving" />
      </q-form>
    </template>
    <q-spinner v-else />

    <q-dialog v-model="confirmRevert" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Do you want to revert your unsaved changes to the last saved version?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Keep editing" color="secondary" v-close-popup />
          <q-btn flat label="Revert" color="negative" v-close-popup @click="onConfirmRevert" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { FreeCompanyDto } from '@app/shared/dto/fcs/free-company.dto';
import errors from '@app/shared/errors';
import FreeCompanyProfile from 'components/free-company/FreeCompanyProfile.vue';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from '@common/common/notify';
import BannerEditSection from 'src/components/common/BannerEditSection.vue';
import CarrdEditSection from 'src/components/common/CarrdEditSection.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import HtmlEditor from '../components/common/HtmlEditor.vue';

const $api = useApi();

async function load(params: RouteParams): Promise<FreeCompanyDto> {
  const name = params.fc as string;
  const server = params.server as string;
  
  try {
    return await $api.freeCompanies.getFreeCompany(name.replace(/_/g, ' '), server);
  } catch (e) {
    notifyError(errors.getMessage(e));
    throw e;
  }
}

@Options({
  components: {
    HtmlEditor,
    FreeCompanyProfile,
    BannerEditSection,
    CarrdEditSection,
  },
  async beforeRouteEnter(to, __, next) {
    const fc = await load(to.params);
    next((vm) => (vm as PageEditFreeCompany).setContent(fc));
  },
  async beforeRouteUpdate(to) {
    const fc = await load(to.params);
    (this as PageEditFreeCompany).setContent(fc);
  },
})
export default class PageEditFreeCompany extends Vue {
  readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
  ];

  fc = new FreeCompanyDto();
  fcBackup = new FreeCompanyDto();
  preview = false;
  saving = false;

  confirmRevert = false;

  setContent(fc: FreeCompanyDto) {
    this.fcBackup = fc;
    this.fc = new FreeCompanyDto(this.fcBackup);
  }

  onRevertClick() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.fc = new FreeCompanyDto(this.fcBackup);
  }

  async onSubmit() {
    this.saving = true;

    try {
      await this.$api.freeCompanies.saveFreeCompany(this.fc);
      this.fcBackup = new FreeCompanyDto(this.fc);

      notifySuccess('Free Company saved.', {
        label: 'View',
        color: 'white',
        handler: () => this.viewFreeCompany(),
      });
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }

  viewFreeCompany() {
    const name = this.fc.name || '';
    const server = this.fc.server || '';
    void this.$router.push(`/fc/${server}/${name.replace(/ /g, '_')}`);
  }
}
</script>

<style lang="scss">
.page-edit-free-company__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-free-company__lodestone-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-edit-free-company__checkbox .q-field__bottom {
  padding-top: 0;
}

.page-edit-free-company__preview {
  margin-bottom: 24px;
}

.page-edit-free-company__age {
  width: 200px;
}

.page-edit-free-company__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-free-company__preview h6 {
  font-family: $header-font;
}
</style>
