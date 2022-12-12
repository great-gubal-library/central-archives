<template>
  <q-page class="page-reset-password">
    <h2>Passwortwiederherstellung</h2>
    <q-form v-if="!submitted" class="page-reset-password__form" @submit="onSubmit">
      <p>
        Du kannst nun ein neues Passwort festlegen.
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
          label="Neues Passwort"
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
          label="Neues Passwort wiederholen"
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
      <div class="page-reset-password__button-bar">
        <q-btn
          label="Neues Passwort festlegen"
          type="submit"
          color="primary"
        />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
    <section v-else class="page-reset-password__form">
      <p>Dein Passwort wurde geändert. Du kannst dich nun <router-link to="/login">einloggen</router-link>.</p>
    </section>
  </q-page>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/SharedConstants';
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

      notifySuccess('Dein Passwort wurde geändert.');
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
