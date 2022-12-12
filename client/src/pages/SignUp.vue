<template>
  <q-page>
    <h2>Anmeldung</h2>
    <q-form v-if="!signedUp" @submit="onSubmit">
      <p>
        Willkommen bei <strong>Elpisgarten</strong>. Bitte fülle das nachfolgende Formular aus um deinen
        Account zu erstellen und deinen ersten Charakter zu registrieren.
      </p>
      <section class="page-signup__form-controls">
        <h6>Accountinformation</h6>
        <q-input
          v-model="email"
          label="E-Mail-Adresse"
          hint="Wird senden dir einen Link um deine E-Mail-Adresse zu bestätigen."
          :rules="[
            $rules.required('Dieses Feld ist erforderlich.'),
            $rules.email('Ungültige E-Mail-Adresse.')
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
        <q-input
          v-model="password"
          label="Passwort"
          type="password"
          :rules="[
            $rules.required('Dieses Feld ist erforderlich.'),
            $rules.minLength(SharedConstants.PASSWORD_MIN_LENGTH, `Passwort muss mindestens ${SharedConstants.PASSWORD_MIN_LENGTH} Zeichen lang sein.`)
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
        <q-input
          v-model="confirmPassword"
          label="Passwort wiederholen"
          type="password"
          :rules="[
						$rules.required('Dieses Feld ist erforderlich.'),
						$rules.sameAs(password, 'Passwörter stimmen nicht überein.')
					]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
      </section>
      <h6>Charakterinformation</h6>
      <character-finder-field class="page-signup__character-finder-field" v-model="character" />
      <h6>Nutzungsbedingungen</h6>
      <div
        class="page-signup__terms-of-use rounded-borders"
        v-html="rules"
      ></div>
      <q-toggle v-model="accept" label="Ich akzeptiere die Nutzungsbedingungen" />
      <div class="page-signup__button-bar">
        <q-btn
          label="Account erstellen"
          type="submit"
          color="primary"
          :disable="!accept"
        />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
    <template v-else>
      <p>Danke das du dich bei uns angemeldet hast! Dein Account wurde erstellt.</p>
      <p>Du wirst nun deine E-Mail-Adresse und die Eigentümerschaft deines Charakters bestätigen müssen. Wir haben dir einen Link an deine E-Mail-Adresse geschickt, damit du deinen Anmeldungsprozess abschließen kannst.</p>
      <p>Du kannst diese Seite nun schließen, oder <router-link to="/verify">überprüfen</router-link> was zur Aktivierung deines Accounts noch aussteht.</p>
    </template>
  </q-page>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/SharedConstants';
import { notifyError, notifySuccess } from 'src/common/notify';
import { CharacterSearchModel } from 'src/components/character/character-search-model';
import CharacterFinderField from 'src/components/character/CharacterFinderField.vue';
import rules from 'src/markdown/rules.md';
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
    CharacterFinderField
  }
})
export default class PageSignUp extends Vue {
  readonly rules = rules;
  readonly SharedConstants = SharedConstants;

  email = '';
  password = '';
  confirmPassword = '';

	character: CharacterSearchModel = {
		name: '',
		server: '',
    avatar: '',
    lodestoneId: -1,
	};

  accept = false;
  loading = false;
  signedUp = false;

  async onSubmit() {
    this.loading = true;

    try {
      const result = await this.$api.user.signUp({
        email: this.email,
        password: this.password,
        lodestoneId: this.character.lodestoneId,
      });

      this.$api.setAccessToken(result.accessToken);
      this.$store.commit('setUser', result.session);

      notifySuccess('Anmeldung erfolgreich! Bitte überprüfe deinen Posteingang um deine E-Mail-Adresse zu bestätigen.');
      this.signedUp = true; // hide form and show post-signup message
    } catch (e) {
      notifyError(e);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss">
.page-signup__form-controls, .page-signup__character-finder-field .character-finder-field__inputs {
  max-width: 500px;
}

.page-signup__terms-of-use {
  border: 1px solid #aaa;
  background: white;
  padding: 16px;
  height: 400px;
  overflow-y: auto;
}

.page-signup__button-bar {
  margin-top: 8px;
  margin-bottom: 16px;
}
</style>
