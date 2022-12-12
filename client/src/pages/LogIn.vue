<template>
  <q-page>
    <h2>Einloggen</h2>
    <q-form class="page-login__form" @submit="onSubmit">
      <p>
        Bitte fülle die nachfolgenden Felder aus um dich auf <strong>Elpisgarten</strong> einzuloggen.
      </p>
      <section>
        <q-input
          v-model="email"
          label="E-Mail-Adresse"
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
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
      </section>
      <p>
        <router-link :to="`/forgot-password/${email}`">Passwort vergessen?</router-link>
      </p>
      <div class="page-login__button-bar">
        <q-btn
          label="Einloggen"
          type="submit"
          color="primary"
        />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { notifyError, notifySuccess } from 'src/common/notify';

export default class PageLogIn extends Vue {
  private email = '';
  private password = '';

  private loading = false;

  async onSubmit() {
    this.loading = true;

    try {
      const result = await this.$api.user.logIn({
        email: this.email,
        password: this.password,
      });

      notifySuccess('Du wurdest erfolgreich eingeloggt.');
      this.$api.setAccessToken(result.accessToken);
      this.$store.commit('setUser', result.session);
      void this.$router.replace('/');
    } catch (e) {
      notifyError(e);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss">
.page-login__form {
  max-width: 500px;
  margin: auto;
}

.page-login__button-bar {
  margin-top: 8px;
  margin-bottom: 16px;
  text-align: right;
}
</style>
