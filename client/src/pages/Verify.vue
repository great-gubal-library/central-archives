<template>
  <q-page>
    <template
      v-if="
        !verificationStatus.emailVerified ||
        !verificationStatus.characterVerified
      "
    >
      <h2>Account Verification</h2>
      <p>
        Before you can post your own content on Chaos Archives, you will need to
        verify your email address and ownership of your character.
      </p>
    </template>
    <template v-else>
      <h2>Verification Complete</h2>
      <p>
        Congratulations! Your email address and character have been successfully
        verified. You may now fill in your character profile and post content on
        Chaos Archives.
      </p>
    </template>
    <q-card class="page-verify__card">
      <q-card-section
        :class="{
          'bg-positive': verificationStatus.emailVerified,
          'text-white': verificationStatus.emailVerified,
        }"
      >
        <h5>Email verification</h5>
        <template v-if="verificationStatus.emailVerified">
          <p>
            Your email address
            <strong>{{ verificationStatus.email }}</strong> has been verified.
          </p>
        </template>
        <template v-else>
          <p>
            Your email address
            <strong>{{ verificationStatus.email }}</strong> still needs to be
            confirmed. Check your inbox for the confirmation link.
          </p>
        </template>
      </q-card-section>
    </q-card>
    <q-card class="page-verify__card">
      <q-card-section
        :class="{
          'bg-positive': verificationStatus.characterVerified,
          'text-white': verificationStatus.characterVerified,
        }"
      >
        <h5>Character verification</h5>
        <template v-if="verificationStatus.characterVerified">
          <p>
            Your character
            <strong>{{ $store.state.user.character.name }}</strong> has been
            verified.
          </p>
        </template>
        <template v-else>
          <p>
            You need to confirm that
            <strong>{{ $store.state.user.character.name }}</strong> is your
            character by editing their character profile on Lodestone. To
            confirm your ownership of your character, follow these steps:
          </p>
          <ol>
            <li>
              Open
              <a :href="lodestoneCharacterLink"
                >{{ $store.state.user.character.name }}'s page on Lodestone</a
              >.
            </li>
            <li>
              Edit the "Character Profile" section below your character
              portrait.
            </li>
            <li>
              Paste the code below anywhere into your character profile.
              <q-input
                readonly
								filled
								dense
                :model-value="verificationStatus.characterVerificationCode"
              >
                <template v-slot:append>
                  <q-btn flat dense icon="content_copy" title="Copy to clipboard" @click="copyVerificationCode" />
                </template>
              </q-input>
            </li>
						<li>Save your changes.</li>
          </ol>
					<p>This page should update automatically when it detects the code in your character profile.</p>
        </template>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { copyToClipboard } from 'quasar';
import minXIVAPI from 'src/util/xivapi-min';
import { Vue } from 'vue-class-component';

const REFRESH_INTERVAL = 5000;

export default class PageVerify extends Vue {
  verificationStatus: VerificationStatusDto = {
    emailVerified: false,
    characterVerified: false,
    email: '',
    characterVerificationCode: null,
  };

  async created() {
    await this.refresh();
  }

  private async refresh() {
		try {
			this.verificationStatus = await this.$api.getVerificationStatus();

			if (!this.verificationStatus.characterVerified) {
				await this.refreshLodestoneStatus();
			}
		} catch (e) {
			console.log(e);
		}

    if (
      !this.verificationStatus.emailVerified ||
      !this.verificationStatus.characterVerified
    ) {
      setTimeout(() => void this.refresh(), REFRESH_INTERVAL);
    } else {
			// Update user role
			const session = await this.$api.getSession();
			this.$store.commit('setUser', session);
		}
  }

	private async refreshLodestoneStatus() {
		try {
			const lodestoneId = this.$store.state.user?.character.lodestoneId;
			const verificationCode = this.verificationStatus.characterVerificationCode;

			if (!lodestoneId || !verificationCode) {
				return;
			}

			const characterData = await minXIVAPI.character.get(lodestoneId);

			if (characterData.Character.Bio.includes(verificationCode)) {
				// Notify the server that the verification code is present in the character profile
				await this.$api.verifyCharacter({ lodestoneId });
				// Refresh immediately
				this.verificationStatus = await this.$api.getVerificationStatus();
			}
		} catch (e) {
			console.log(e);
		}
	}

  get lodestoneCharacterLink() {
    const lodestoneId = this.$store.state.user?.character.lodestoneId || -1; // guaranteed to exist
    return `https://eu.finalfantasyxiv.com/lodestone/character/${lodestoneId}/`;
  }

	async copyVerificationCode() {
		if (!this.verificationStatus.characterVerificationCode) {
			return;
		}

		try {
			await copyToClipboard(this.verificationStatus.characterVerificationCode);
			this.$q.notify({
				type: 'positive',
				message: 'Character verification code copied to clipboard.'
			});
		} catch (e) {
			this.$q.notify({
				type: 'negative',
				message: 'Error copying to clipboard.'
			});
		}
	}
}
</script>

<style lang="scss">
.page-verify__card {
  margin-bottom: 16px;
}
</style>
