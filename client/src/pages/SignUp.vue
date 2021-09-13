<template>
  <q-page>
    <h2>Sign Up</h2>
    <p>
      Welcome to Chaos Archives. Please fill in the form below to create your
      account and register your first character.
    </p>
    <q-form @submit="onSubmit">
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
      <div class="flex">
        <section class="page-signup__form-controls">
          <q-select
            :model-value="character"
            :display-value="character.name"
            :options="characterOptions"
            :option-label="(option) => `${option.name} (${option.server})`"
            hide-dropdown-icon
            use-input
            emit-value
            input-debounce="200"
            label="Character name"
            :hint="character.server ? '' : 'Start typing, and we will attempt to find your character.'"
            @filter="onCharacterFilter"
            @update:model-value="onCharacterSelected"
            :rules="[
              $rules.required('You must select a character.'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="face" />
            </template>
            <template v-slot:append>
              <q-btn v-if="character.server" flat dense icon="delete" title="Clear" @click="clearCharacter" />
            </template>
          </q-select>
          <q-input :model-value="character.server" label="Server" readonly>
            <template v-slot:prepend>
              <q-icon name="computer" />
            </template>
          </q-input>
        </section>
        <div class="page-signup__avatar">
          <q-img width="96px" height="96px" :src="character.avatar" />
        </div>
      </div>
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
  </q-page>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/SharedConstants';
import minXIVAPI from 'src/util/xivapi-min';
import rules from 'src/markdown/rules.md';
import { Vue } from 'vue-class-component';
import errors from 'src/util/errors';

interface Character {
	name: string;
	server: string;
  avatar: string;
}

// Datacenter name in parentheses: (Chaos)
const SERVER_SUFFIX = `(${SharedConstants.DATACENTER})`;

export default class PageSignUp extends Vue {
  readonly rules = rules;
  readonly SharedConstants = SharedConstants;

  private email = '';
  private password = '';
  private confirmPassword = '';

	private character: Character = {
		name: '',
		server: '',
    avatar: '',
	};
	private characterOptions: Character[] = [];
  private characterOptionsSearchString = '';

  private accept = false;
  private loading = false;

	async onCharacterFilter(value: string, update: () => void, abort: () => void) {
    value = value.trim();

    // require that the name consists of at least two components, each at least two characters long
    if (!(/.. ../.exec(value))) {
      this.characterOptions = [];
      update();
      return;
    }

    try {
      this.characterOptionsSearchString = value;
      const results = (await minXIVAPI.character.search(value)).Results;

      if (this.characterOptionsSearchString !== value) {
        // Too late
        return;
      }

      this.characterOptions = results.filter(result => result.Server.endsWith(SERVER_SUFFIX)).map(result => ({
        name: result.Name,
        server: result.Server.split(/\s/)[0], // remove datacenter suffix
        avatar: result.Avatar,
      }));
      
      update();
    } catch (e) {
      abort();
      throw e;
    }
	}

  onCharacterSelected(character?: Character) {
    if (character) {
      this.character = character;
    }
  }

  clearCharacter() {
    this.character.name = '';
    this.character.server = '';
  }

  async onSubmit() {
    this.loading = true;

    try {
      await this.$api.signUp({
        email: this.email,
        password: this.password,
        confirmPassword: this.confirmPassword,
        characterName: this.character.name,
        server: this.character.server
      });

      this.$q.notify({
        message: 'Registration successful! Please check your inbox to confirm your email address.',
        type: 'positive'
      });
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
.page-signup__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-signup__avatar {
  margin-left: 16px;
}

.page-signup__avatar img {
  border-radius: 50%;
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
