<template>
  <q-page class="page-forgot-password">
    <h2>Passwort wiederherstellen</h2>
    <q-form
      v-if="!submitted"
      class="page-forgot-password__form"
      @submit="onSubmit"
    >
      <p>Solltest du dein Passwort vergessen haben, kannst du die E-Mail-Adresse angeben welche du für deine Registrierung verwendet hast. Wir werden dir einen Wiederherstellungslink zum Zurücksetzen deines Passworts schicken.</p>
      <section>
        <q-input
          v-model="email"
          label="E-Mail-Adresse"
          :rules="[
            $rules.required('Dieses Feld ist erforderlich.'),
            $rules.email('Ungültige E-Mail-Adresse.'),
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
      </section>
      <div class="page-forgot-password__button-bar">
        <q-btn label="Wiederherstellungslink senden" type="submit" color="primary" />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
    <section v-else class="page-forgot-password__form">
      <p>
        Der Wiederherstellungslink für dein Passwort wurde gesendet. Prüfe den Posteingang von
        <strong>{{ email }}</strong>. Solltest du auf Elpisgarten registriert sein, wirst du eine E-Mail
         mit weiteren Anweisungen erhalten.
      </p>
      <p>Du kannst diese Seite nun schließen.</p>
      <hr />
      <div class="row">
        <p class="col">Keinen Wiederherstellungslink erhalten?</p>
        <div class="col text-right">
          <q-btn label="Erneut versuchen" color="primary" @click="tryAgain" />
        </div>
      </div>
    </section>
  </q-page>
</template>

<script lang="ts">
import { notifyError, notifySuccess } from 'src/common/notify';
import { Vue } from 'vue-class-component';

export default class PageLogIn extends Vue {
  private email = '';

  private loading = false;
  private submitted = false;

  created() {
    this.email = (this.$route.params.email as string) || '';
  }

  async onSubmit() {
    this.loading = true;

    try {
      await this.$api.user.forgotPassword({
        email: this.email,
      });

      this.submitted = true;

      notifySuccess('Wiederherstellungslink gesendet.');
    } catch (e) {
      notifyError(e);
    } finally {
      this.loading = false;
    }
  }

  tryAgain() {
    this.submitted = false;
  }
}
</script>

<style lang="scss">
.page-forgot-password__form {
  max-width: 500px;
  margin: auto;
}

.page-forgot-password__button-bar {
  margin-top: 8px;
  margin-bottom: 16px;
  text-align: right;
}
</style>
