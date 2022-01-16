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
          </section>
          <h6>Description</h6>
          <html-editor v-model="fc.description" />
          <section class="page-edit-free-company__form-controls">
            <h6>Carrd integration</h6>
            <p class="text-caption">Leave blank if you don't have a Carrd profile or don't want to it on your page.</p>
            <q-input
              :modelValue="fc.carrdProfile"
              @update:modelValue="setCarrdProfileLink"
              label="Carrd profile"
              :rules="[
                (val) => /^[A-Za-z0-9-]*$/.test(val) || 'Copy the part before .carrd.co in your Carrd profile here.'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="link" />
              </template>
              <template v-slot:after> .carrd.co </template>
            </q-input>
          </section>
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
import FreeCompanyProfile from 'components/free-company/FreeCompanyProfile.vue';
import errors from '@app/shared/errors';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import BannerEditSection from 'src/components/common/BannerEditSection.vue';
import { Options, Vue } from 'vue-class-component';
import HtmlEditor from '../components/common/HtmlEditor.vue';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $q = useQuasar();

async function load(params: RouteParams): Promise<FreeCompanyDto> {
  const name = params.fc as string;
  const server = params.server as string;
  
  try {
    return await $api.freeCompanies.getFreeCompany(name.replace(/_/g, ' '), server);
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: errors.getMessage(e),
    });
    throw e;
  }
}

@Options({
  components: {
    HtmlEditor,
    FreeCompanyProfile,
    BannerEditSection,
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

      this.$q.notify({
        message: 'Free Company saved.',
        type: 'positive',
        actions: [
          {
            label: 'View',
            color: 'white',
            handler: () => this.viewFreeCompany(),
          },
        ],
      });
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative',
      });
    } finally {
      this.saving = false;
    }
  }

  viewFreeCompany() {
    const name = this.fc.name || '';
    const server = this.fc.server || '';
    void this.$router.push(`/fc/${server}/${name.replace(/ /g, '_')}`);
  }

  setCarrdProfileLink(newValue: string) {
    const urlMatch = /https:\/\/([^.]+)\.carrd\.co/.exec(newValue);

    if (!urlMatch) {
      this.fc.carrdProfile = newValue;
    } else {
      this.fc.carrdProfile = urlMatch[1];
    }
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
