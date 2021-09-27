<template>
  <q-page>
    <h2>Log In</h2>
    <q-form class="page-login__form" @submit="onSubmit">
      <p>
        Please fill in the form below to log in to Chaos Archives.
      </p>
      <section>
        <q-input
          v-model="email"
          label="Email"
          :rules="[
            $rules.required('This field is required.'),
            $rules.email('Invalid email address.')
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
        <q-input
          v-model="password"
          label="Password"
          type="password"
          :rules="[
            $rules.required('This field is required.'),
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
      </section>
      <p>
        <router-link :to="`/forgot-password/${email}`">Forgot your password?</router-link>
      </p>
      <div class="page-login__button-bar">
        <q-btn
          label="Log in"
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
import errors from '@app/shared/errors';

export default class PageLogIn extends Vue {
  private email = '';
  private password = '';

  private loading = false;

  async onSubmit() {
    this.loading = true;

    try {
      const result = await this.$api.logIn({
        email: this.email,
        password: this.password,
      });

      this.$q.notify({
        message: 'You have successfully logged in.',
        type: 'positive'
      });

      this.$api.setAccessToken(result.accessToken);
      this.$store.commit('setUser', result.session);
      void this.$router.replace('/');
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative'
      });
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
