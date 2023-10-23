<template>
  <q-page>
    <h2>Sign Up</h2>
    <q-form v-if="!signedUp" @submit="onSubmit">
      <p>
        Welcome to Chaos Archives. Please fill in the form below to create your
        account and register your first character.
      </p>
      <p>
        Signups are limited to the <strong>Europe</strong> region.
      </p>
      <section class="page-signup__form-controls">
        <h6>Account information</h6>
        <q-input
          v-model="email"
          label="Email"
          hint="We will send you an email message with a link to confirm your address."
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
            $rules.minLength(SharedConstants.PASSWORD_MIN_LENGTH, `Password must be at least ${SharedConstants.PASSWORD_MIN_LENGTH} characters long.`)
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
        <q-input
          v-model="confirmPassword"
          label="Confirm password"
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
      <h6>Character information</h6>
      <character-finder-field class="page-signup__character-finder-field" v-model="character" />
      <h6>Terms of use</h6>
      <div
        class="page-signup__terms-of-use rounded-borders"
        v-html="rules"
      ></div>
      <q-toggle v-model="accept" label="I accept the terms of use" />
      <div class="page-signup__button-bar">
        <q-btn
          label="Create your account"
          type="submit"
          color="primary"
          :disable="!accept"
        />
      </div>
      <q-inner-loading :showing="loading" />
    </q-form>
    <template v-else>
      <p>Thank you for signing up! Your account has been created.</p>
      <p>You will now need to verify your email address and your ownership of the character. We have sent you an email message with a link for continuing your signup process.</p>
      <p>You can now close this page, or <router-link to="/verify">check</router-link> what remains to be done to activate your account.</p>
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

      notifySuccess('Registration successful! Please check your inbox to confirm your email address.');
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
