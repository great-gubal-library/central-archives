<template>
  <q-page class="page-forgot-password">
    <h2>Password Recovery</h2>
    <q-form
      v-if="!submitted"
      class="page-forgot-password__form"
      @submit="onSubmit"
    >
      <p>If you have forgotten your password, fill in the email address you used to sign up, and we will send you a link to reset your password.</p>
      <section>
        <q-input
          v-model="email"
          label="Email"
          :rules="[
            $rules.required('This field is required.'),
            $rules.email('Invalid email address.'),
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
      </section>
      <div class="page-forgot-password__button-bar">
        <q-btn label="Send password reset link" type="submit" color="primary" />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
    <section v-else class="page-forgot-password__form">
      <p>
        Your password reset link has been sent. Check your inbox at
        <strong>{{ email }}</strong>. If you are registered on Chaos Archives, you will receive an email
        with further instructions.
      </p>
      <p>You can now close this page.</p>
      <hr />
      <div class="row">
        <p class="col">Did not receive your link?</p>
        <div class="col text-right">
          <q-btn label="Try again" color="primary" @click="tryAgain" />
        </div>
      </div>
    </section>
  </q-page>
</template>

<script lang="ts">
import errors from '@app/shared/errors';
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

      this.$q.notify({
        message: 'Password reset link sent.',
        type: 'positive',
      });
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative',
      });
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
