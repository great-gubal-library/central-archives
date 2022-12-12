<template>
  <q-page>
    <template v-if="!verificationStatus.emailVerified || !verificationStatus.characterVerified">
      <template v-if="verifyingAccount">
        <h2>Accountverifizierung</h2>
        <p>
          Bevor du deine eigenen Inhalte auf <strong>Elpisgarten</strong> verfassen kannst, musst du deine E-Mail-Adresse und
          die Eigentümerschaft deines Charakters bestätigen.
        </p>
      </template>
      <template v-else>
        <h2>Charakterverifizierung</h2>
        <p>
          Bevor du Inhalte auf <strong>Elpisgarten</strong> unter diesem Charakter verfassen kannst, musst du deine Eigentümerschaft bestätigen.
        </p>
      </template>
    </template>
    <template v-else>
      <h2>Verifizierung abgeschlossen</h2>
      <p>
        Glückwunsch! Deine E-Mail-Adresse und dein Charakter wurden erfolgreich bestätigt. Du kannst nun dein
        Charakterprofil ausfüllen und Inhalte auf <strong>Elpisgarten</strong> veröffentlichen.
      </p>
    </template>
    <q-card class="page-verify__card" v-if="verifyingAccount">
      <q-card-section
        :class="{
          'bg-positive': verificationStatus.emailVerified,
          'text-white': verificationStatus.emailVerified,
        }"
      >
        <h5>E-Mail-Verifizierung</h5>
        <template v-if="verificationStatus.emailVerified">
          <p>
            Deine E-Mail-Adresse
            <strong>{{ verificationStatus.email }}</strong> wurde verifiziert.
          </p>
        </template>
        <template v-else>
          <p>
            Your email address
            <strong>{{ verificationStatus.email }}</strong> muss noch bestätigt werden. Überprüfe deinen Posteingang für den
            Bestätigungslink.
          </p>
          <p>Solltest du keine E-Mail zur Bestätigung erhalten haben, klicke auf die untenstehendene Schaltfläche:</p>
          <q-btn
            color="secondary"
            label="Bestätigung erneut senden"
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
            Dein Charakter
            <strong>{{ $store.getters.character?.name }}</strong> wurde verifiziert.
          </p>
        </template>
        <template v-else>
          <p>
            Du musst bestätigen das
            <strong>{{ $store.getters.character?.name }}</strong> dein Charakter ist, indem du das Profil im Lodestone
            bearbeitest. Um die Eigentümerschaft dieses Charakters zu bestätigen, sind die folgenden Schritte erforderlich:
          </p>
          <ol>
            <li>
              Öffne
              <a :href="lodestoneCharacterLink" target="_blank"
                >{{ $store.getters.character?.name }}'s Profilseite im Lodestone
                <q-icon class="external-link-icon" name="launch" /></a
              >.
            </li>
            <li>Bearbeite die "Vorstellung" unterhalb des Charakterbildes.</li>
            <li>
              Kopiere den untenstehenden Code irgendwo in deine Vorstellung.
              <q-input readonly filled dense :model-value="verificationStatus.characterVerificationCode">
                <template v-slot:append>
                  <q-btn flat dense icon="content_copy" title="In Zwischenablage speichern" @click="copyVerificationCode" />
                </template>
              </q-input>
            </li>
            <li>Klicke auf Bestätigen um eine Vorschau deiner Änderungen zu sehen.</li>
            <li><strong>Klicke erneut auf Bestätigen</strong> um deine Änderungen zu speichern.</li>
          </ol>
          <p>Diese Seite wird sich automatisch aktualisieren sobald sie den Code in deiner Vorstellung erkennt.</p>
        </template>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { copyToClipboard } from 'quasar';
import errors from '@app/shared/errors';
import { Vue } from 'vue-class-component';
import { Role } from '@app/shared/enums/role.enum';
import { notifyError, notifySuccess } from 'src/common/notify';

const REFRESH_INTERVAL = 5000;

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
      const session = await this.$api.user.getSession();
      this.$store.commit('setUser', session);
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
      notifySuccess('Verifizierungscode wurde in der Zwischenablage gespeichert.');
    } catch (e) {
      notifyError(e);
    }
  }

  async resendConfirmationEmail() {
    this.resendingEmail = true;

    try {
      await this.$api.user.resendConfirmationEmail();
      notifySuccess('E-Mail versendet. Überprüfe deinen Posteingang.');
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
