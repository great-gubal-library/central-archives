<template>
  <q-page class="page-edit-community">
    <template v-if="loaded">
      <h2>{{ communityId ? 'Community bearbeiten' : 'Community erstellen' }}</h2>
      <q-form ref="form" @submit="onSubmit">
        <template v-if="!preview">
          <section class="page-edit-community__form-controls">
            <q-input
              v-model="community.name"
              label="Name *"
              :rules="[
                $rules.required('Dieses Feld ist erforderlich.'),
              ]"
            />
            <q-input
              class="page-edit-community__founded-at"
              label="Gründung"
              :model-value="foundedAtDisplay"
              readonly
              :rules="[
                $rules.required('Dieses Feld ist erforderlich.'),
              ]"
            >
              <template v-slot:append>
                <template v-if="community.foundedAt">
                  <q-icon name="clear" class="cursor-pointer" @click="community.foundedAt = null" />&nbsp;
                </template>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="community.foundedAt" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Schließen" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-model="community.website"
              label="Webseite"
              :rules="[
                $rules.url('Bitte hinterlasse einen Link.'),
              ]"
            />
            <q-input
              v-model="community.discord"
              label="Discordeinladung"
              :rules="[
                $rules.url('Bitte hinterlasse einen Link.'),
              ]"
            />
            <q-input
              v-model="community.goal"
              label="Ziel"
            />
            <q-input
              v-model="community.status"
              label="Status"
            />
            <q-input
              v-model="community.recruitingOfficers"
              label="Rekrutierer"
            />
            <div class="text-caption">Du kannst [[Wikilinks]], z.B. [[Charaktername]], in <strong>Ziel</strong>, <strong>Status</strong> und <strong>Rekrutierer</strong> nutzen.</div>
            <q-input
              :model-value="tags"
              @update:model-value="onTagsChanged"
              label="Schlagworte (mit Komma getrennt)"
            />
          </section>
          <banner-edit-section v-model="community.banner" />
          <h6>Beschreibung</h6>
          <html-editor v-model="community.description" />
          <carrd-edit-section
            class="page-edit-community__form-controls"
            entity-type="community"
            v-model="community.carrdProfile"
          />
        </template>
        <section v-else class="page-edit-community__preview">
          <community-profile :community="community" :preview="true" />
        </section>
        <div class="page-edit-community__button-bar">
          <q-btn-toggle
            v-model="preview"
            :options="previewOptions"
            toggle-color="secondary"
          />
          <div class="page-edit-community__revert-submit">
            <q-btn label="Zurücksetzen" color="secondary" @click="revert" />&nbsp;
            <q-btn label="Änderungen speichern" type="submit" color="primary" />
          </div>
        </div>
        <q-inner-loading :showing="saving" />
      </q-form>
    </template>
    <q-spinner v-else />

    <q-dialog v-model="confirmRevert" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Möchtest du die ungespeicherten Änderungen auf die letzte gespeicherte Version zurücksetzen?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Bearbeitung fortsetzen" color="secondary" v-close-popup />
          <q-btn
            flat
            label="Zurücksetzen"
            color="negative"
            v-close-popup
            @click="onConfirmRevert"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import { MembershipStatus } from '@app/shared/enums/membership-status.enum';
import errors from '@app/shared/errors';
import SharedConstants from '@app/shared/SharedConstants';
import HtmlEditor from 'components/common/HtmlEditor.vue';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import BannerEditSection from 'src/components/common/BannerEditSection.vue';
import CarrdEditSection from 'src/components/common/CarrdEditSection.vue';
import CommunityProfile from 'src/components/communities/CommunityProfile.vue';
import { useRouter } from 'src/router';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $store = useStore();
const $router = useRouter();

async function load(params: RouteParams): Promise<CommunityDto|null> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		return null;
	}

	try {
		return await $api.communities.getCommunity(id, $store.getters.characterId!);
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			notifyError('Community konnte nicht gefunden werden.');
		} else {
			notifyError(errors.getMessage(e));
		}

    void $router.replace('/');
		throw e;
	}
}

@Options({
  name: 'PageEditCommunity',
  components: {
    CommunityProfile,
    HtmlEditor,
    BannerEditSection,
    CarrdEditSection,
  },
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageEditCommunity).setContent(content));
	},
	async beforeRouteUpdate(to) {
		(this as PageEditCommunity).setContent(await load(to.params));
	},
})
export default class PageEditCommunity extends Vue {
  readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
  ];

  readonly SharedConstants = SharedConstants;

	communityId: number|null = null;
  community = new CommunityDto();
  communityBackup = new CommunityDto();

  preview = false;
  loaded = false;
  saving = false;

  confirmRevert = false;

  setContent(community: CommunityDto|null) {
		if (community) {
			this.communityId = community.id;
			this.communityBackup = new CommunityDto(community);
    } else {
      this.communityId = null;
      this.communityBackup = new CommunityDto({
        id: null as unknown as number,
        mine: true,
        membershipStatus: MembershipStatus.CONFIRMED,
        canEdit: true,
        canManageMembers: true,
        foundedAt: null,
        name: '',
        owner: this.$store.getters.character!.name,
        ownerServer: this.$store.getters.character!.server,
        description: '',
        website: '',
        discord: '',
        goal: '',
        recruitingOfficers: '',
        status: '',
        carrdProfile: '',
        banner: null,
        tags: []
      });
    }

    this.loaded = true;
    this.community = new CommunityDto(this.communityBackup);
  }

  get foundedAtDisplay() {
    return this.community.foundedAt ? this.$display.formatDate(this.community.foundedAt) : '(Unknown)';
  }

  get tags() {
    return this.community.tags.join(', ');
  }

  onTagsChanged(newTags: string) {
    this.community.tags = newTags.split(/,\s*/).map((tag) => tag.trim()).filter(tag => tag !== '');
  }

  revert() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.community = new CommunityDto(this.communityBackup);
  }

  async onSubmit() {
    this.saving = true;

    try {
      if (!this.communityId) {
        const result = await this.$api.communities.createCommunity(this.community);
        this.community.id = result.id;
        this.communityId = result.id;
        void this.$router.replace(`/edit-community/${result.id}`);
      } else {
        await this.$api.communities.editCommunity(this.community);
      }

      this.communityBackup = new CommunityDto(this.community);

      notifySuccess('Community gespeichert.', {
        label: 'Anschauen',
        color: 'white',
        handler: () => this.viewCommunity(),
      });
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }

  viewCommunity() {
    if (this.community.name) {
      void this.$router.push(`/community/${this.community.name}`);
    }
  }
}
</script>

<style lang="scss">
.page-edit-community__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.q-field--standard.q-field--readonly.page-edit-community__founded-at .q-field__control::before {
  border-bottom-style: solid;
}

.page-edit-community__preview {
  margin-bottom: 24px;
}

.page-edit-community__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-community__preview h6 {
  font-family: $header-font;
}
</style>
