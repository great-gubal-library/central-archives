<template>
  <section class="page-login">
    <h2>Log In</h2>
    <q-form class="page-login__form" @submit="onSubmit">
      <p>
        Please fill in the form below to log in to the Harborwatch.
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
        <a target="_blank" :href="forgotPasswordLink">Forgot your password?</a>
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
  </section>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { notifyError, notifySuccess } from 'src/common/notify';
import { CHAOS_ARCHIVES_ROOT } from 'src/common/interop';

export default class PageLogIn extends Vue {
  email = '';
  password = '';

  loading = false;

	get forgotPasswordLink() {
		return `${CHAOS_ARCHIVES_ROOT}/forgot-password/${this.email}`;
	}

  async onSubmit() {
    this.loading = true;

    try {
      const result = await this.$api.user.logIn({
        email: this.email,
        password: this.password,
      });

      notifySuccess('You have successfully logged in.');
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
