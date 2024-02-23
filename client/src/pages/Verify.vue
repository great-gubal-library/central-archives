<template>
  <q-page>
    <template v-if="!verificationStatus.emailVerified || !verificationStatus.characterVerified">
      <template v-if="verifyingAccount">
        <h2>Account Verification</h2>
        <p>
          Before you can post your own content on {{$siteName}}, you will need to verify your email address and
          ownership of your character.
        </p>
      </template>
      <template v-else>
        <h2>Character Verification</h2>
        <p>
          Before you can post content on {{$siteName}} under this character's name, you will need to verify your
          ownership.
        </p>
      </template>
    </template>
    <template v-else>
      <h2>Verification Complete</h2>
      <p>
        Congratulations! Your email address and character have been successfully verified. You may now fill in your
        character profile and post content on {{$siteName}}.
      </p>
    </template>
    <q-card class="page-verify__card" v-if="verifyingAccount">
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
            <strong>{{ verificationStatus.email }}</strong> still needs to be confirmed. Check your inbox for the
            confirmation link.
          </p>
          <p>If you have not received your confirmation email, click the button below:</p>
          <q-btn
            color="secondary"
            label="Resend confirmation email"
            :loading="resendingEmail"
            @click="resendConfirmationEmail"
          />
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
            <strong>{{ $store.getters.character?.name }}</strong> has been verified.
          </p>
        </template>
        <template v-else>
          <p>
            You need to confirm that
            <strong>{{ $store.getters.character?.name }}</strong> is your character by editing their character profile
            on Lodestone. To confirm your ownership of your character, follow these steps:
          </p>
          <ol>
            <li>
              Open
              <a :href="lodestoneCharacterLink" target="_blank"
                >{{ $store.getters.character?.name }}'s page on Lodestone
                <q-icon class="external-link-icon" name="launch" /></a
              >.
            </li>
            <li>Edit the "Character Profile" section below your character portrait.</li>
            <li>
              Paste the code below anywhere into your character profile.
              <q-input readonly filled dense :model-value="verificationStatus.characterVerificationCode">
                <template v-slot:append>
                  <q-btn flat dense icon="content_copy" title="Copy to clipboard" @click="copyVerificationCode" />
                </template>
              </q-input>
            </li>
            <li>Click Confirm to preview your changes.</li>
            <li><strong>Click Confirm again</strong> to save your changes.</li>
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
import errors from '@app/shared/errors';
import { Options, Vue } from 'vue-class-component';
import { Role } from '@app/shared/enums/role.enum';
import { notifyError, notifySuccess } from 'src/common/notify';
import { useStore } from 'src/store';
import { useRouter } from 'src/router';

const $store = useStore();
const $router = useRouter();

const REFRESH_INTERVAL = 5000;

@Options({
	name: 'PageVerify',
	beforeRouteEnter() {
    if (!$store.state.user) {
			void $router.replace('/');
      notifyError('You must log in to view this page');
      throw new Error();
    }
  },
})
export default class PageVerify extends Vue {
  readonly Role = Role;

  verificationStatus: VerificationStatusDto = {
    emailVerified: false,
    characterVerified: false,
    email: '',
    characterVerificationCode: null,
  };

  verifyingAccount = false;

  resendingEmail = false;

  private refreshTimerId: NodeJS.Timeout|null = null;

  async created() {
    if (this.$store.getters.realRole === Role.UNVERIFIED) {
      this.verifyingAccount = true;
    }

    await this.refresh();
  }

  unmounted() {
    // We're leaving the page, so stop the refresh timer.
    if (this.refreshTimerId !== null) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  private async refresh() {
    try {
      this.verificationStatus = await this.$api.user.getVerificationStatus(this.$store.getters.characterId!);

      if (!this.verificationStatus.characterVerified) {
        await this.refreshLodestoneStatus();
      }
    } catch (e) {
      console.log(e);
    }

    if (!this.verificationStatus.emailVerified || !this.verificationStatus.characterVerified) {
      this.refreshTimerId = setTimeout(() => void this.refresh(), REFRESH_INTERVAL);
    } else {
      // Update user role
      const sessionResponse = await this.$api.user.getSession();
      this.$api.maybeUpdateAccessToken(sessionResponse.newAccessToken);
      this.$store.commit('setUser', sessionResponse.session);
    }
  }

  private async refreshLodestoneStatus() {
    try {
      const characterId = this.$store.getters.characterId;
      const verificationCode = this.verificationStatus.characterVerificationCode;

      if (!characterId || !verificationCode) {
        return;
      }

      await this.$api.user.verifyCharacter({ id: characterId });
      // If we get here, this means character verification succeeded.
      this.verificationStatus = await this.$api.user.getVerificationStatus(this.$store.getters.characterId!);
    } catch (e) {
      if (errors.getStatusCode(e) !== 404) {
        console.log(e);
      }
    }
  }

  get lodestoneCharacterLink() {
    const lodestoneId = this.$store.getters.character!.lodestoneId || -1; // guaranteed to exist
    return `https://eu.finalfantasyxiv.com/lodestone/character/${lodestoneId}/`;
  }

  async copyVerificationCode() {
    if (!this.verificationStatus.characterVerificationCode) {
      return;
    }

    try {
      await copyToClipboard(this.verificationStatus.characterVerificationCode);
      notifySuccess('Character verification code copied to clipboard.');
    } catch (e) {
      notifyError(e);
    }
  }

  async resendConfirmationEmail() {
    this.resendingEmail = true;

    try {
      await this.$api.user.resendConfirmationEmail();
      notifySuccess('Email sent. Check your inbox.');
    } catch (e) {
      notifyError(e);
    } finally {
      this.resendingEmail = false;
    }
  }
}
</script>

<style lang="scss">
.page-verify__card {
  margin-bottom: 16px;
}
</style>
