<template>
  <q-page>
    <h2>Log In</h2>
    <q-form class="page-login__form" @submit="onSubmit">
      <p>Please fill in the form below to log in to Chaos Archives.</p>
      <section>
        <q-input
          v-model="email"
          label="Email"
          :rules="[$rules.required('This field is required.'), $rules.email('Invalid email address.')]"
        >
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
        <q-input
          v-model="password"
          label="Password"
          type="password"
          :rules="[$rules.required('This field is required.')]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
        <q-slide-transition>
          <section v-if="showOtp">
            <q-input
              v-model="otp"
              label="One-time password or backup code"
              :rules="[$rules.required('This field is required.'), (val) => isValidOtp(val)]"
            >
              <template v-slot:prepend>
                <q-icon name="pin" />
              </template>
            </q-input>
            <div class="text-caption">
              Your account is protected by two-factor authentication. Please input a one-time password from your
              authenticator (six digits), or your backup code if you lost your authenticator.
            </div>
          </section>
        </q-slide-transition>
      </section>
      <p class="page-login__forgot-password">
        <router-link :to="`/forgot-password/${email}`">Forgot your password?</router-link>
      </p>
      <div class="page-login__button-bar">
        <q-btn label="Log in" type="submit" color="primary" />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { notifyError, notifySuccess } from 'src/common/notify';
import SharedConstants from '@app/shared/SharedConstants';
import errors from '@app/shared/errors';

export default class PageLogIn extends Vue {
  email = '';
  password = '';
  otp = '';

  showOtp = false;
  loading = false;

  isValidOtp(otp: string): string | boolean {
    if (!otp) {
      return true;
    }

    if (SharedConstants.OTP_REGEX.test(otp) || SharedConstants.CLIENT_BACKUP_CODE_REGEX.test(otp)) {
      return true;
    }

    return 'Invalid one-time password or backup code';
  }

  async onSubmit() {
    this.loading = true;

    try {
      const result = await this.$api.user.logIn({
        email: this.email,
        password: this.password,
        otp: this.otp || null,
      });

      notifySuccess('You have successfully logged in.');
      this.$api.setAccessToken(result.accessToken);
      this.$store.commit('setUser', result.session);
      void this.$router.replace('/');
    } catch (e) {
      if (errors.getStatusCode(e) === 400 && errors.getMessage(e) === SharedConstants.errorCodes.OTP_REQUIRED) {
        this.showOtp = true;
      } else {
        notifyError(e);
      }
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

.page-login__forgot-password {
  margin-top: 16px;
}
</style>
