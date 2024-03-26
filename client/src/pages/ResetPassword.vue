<template>
  <q-page class="page-reset-password">
    <h2>Password Recovery</h2>
    <q-form v-if="!submitted" class="page-reset-password__form" @submit="onSubmit">
      <p>
        You are now ready to set your new password.
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
          label="New password"
          type="password"
          :rules="[
            $rules.required('This field is required.'),
            $rules.minLength(SharedConstants.PASSWORD_MIN_LENGTH, `Password must be at least ${SharedConstants.PASSWORD_MIN_LENGTH} characters long.`)
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
        <q-input
          v-model="confirmPassword"
          label="Confirm new password"
          type="password"
          :rules="[
						$rules.required('This field is required.'),
						$rules.sameAs(password, 'Passwords do not match.')
					]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
      </section>
      <div class="page-reset-password__button-bar">
        <q-btn
          label="Set new password"
          type="submit"
          color="primary"
        />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
    <section v-else class="page-reset-password__form">
      <p>Your password has been changed. You can now <router-link to="/login">log in</router-link>.</p>
    </section>
  </q-page>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/shared-constants';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Vue } from 'vue-class-component';

export default class PageLogIn extends Vue {
  readonly SharedConstants = SharedConstants;

  private verificationCode = '';
  private email = '';
  private password = '';
  private confirmPassword = '';

  private loading = false;
  private submitted = false;

  created() {
		this.verificationCode = this.$route.params.verificationToken as string;

		if (!this.verificationCode) {
			void this.$router.replace('/');
			return;
		}
  }

  async onSubmit() {
    this.loading = true;

    try {
      await this.$api.user.resetPassword({
        email: this.email,
        password: this.password,
        confirmPassword: this.confirmPassword,
        verificationCode: this.verificationCode,
      });

      this.submitted = true;

      notifySuccess('You password has been changed.');
    } catch (e) {
      notifyError(e);
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss">
.page-reset-password__form {
  max-width: 500px;
  margin: auto;
}

.page-reset-password__button-bar {
  margin-top: 8px;
  margin-bottom: 16px;
  text-align: right;
}
</style>
