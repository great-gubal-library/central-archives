<template>
  <div class="character-finder-field">
    <div class="character-finder-field__row">
      <div class="character-finder-field__inputs">
        <q-select
          :model-value="modelValue.name ? modelValue : null"
          :display-value="modelValue.name"
          :options="characterOptions"
          :option-label="(option) => `${option.name} (${option.server})`"
          hide-dropdown-icon
          use-input
          input-debounce="200"
          label="Character name"
          :hint="hint"
          @filter="onCharacterFilter"
          @update:model-value="onCharacterSelected"
          :rules="[(val) => (!!val && !!val.server) || 'You must select a character.']"
        >
          <template v-slot:prepend>
            <q-icon name="face" />
          </template>
          <template v-slot:append>
            <q-btn v-if="modelValue.server" flat dense icon="delete" title="Clear" @click="clearCharacter" />
          </template>
        </q-select>
        <q-input :model-value="modelValue.server" label="World" readonly>
          <template v-slot:prepend>
            <q-icon name="public" />
          </template>
        </q-input>
      </div>
      <div class="character-finder-field__avatar">
        <q-img width="96px" height="96px" :src="modelValue.avatar" />
      </div>
    </div>
    <div class="character-finder-field__alerts" v-if="registrationStatus">
      <q-banner
        v-if="registrationStatus === CharacterRegistrationStatus.CLAIMED_BY_ANOTHER_USER"
        class="bg-negative text-white"
      >
        This character has already been claimed by another user.
      </q-banner>
      <q-banner
        v-else-if="registrationStatus === CharacterRegistrationStatus.ALREADY_REGISTERED"
        class="bg-negative text-white"
      >
        You have already registered this character.
      </q-banner>
      <q-banner v-else-if="registrationStatus === CharacterRegistrationStatus.RENAMED" class="bg-dark text-white">
        <p>
          You have renamed this character in-game, and you have a {{ $siteName }} character profile under the old name.
          You still <strong>can</strong> register a separate character profile for the new name; however, you will no
          longer be able to rename the old character on {{ $siteName }} to match the new name.
        </p>
        <p>
          If you would rather update your existing character profile to the new name, open your existing character
          profile and click “Refresh from Lodestone”.
        </p>
      </q-banner>
    </div>
  </div>
</template>

<script lang="ts">
import { CharacterRegistrationStatus } from '@app/shared/enums/character-registration-status.enum';
import { Options, prop, Vue } from 'vue-class-component';
import { CharacterSearchModel } from './character-search-model';
import { notifyError } from 'src/common/notify';
import { asRegionOrThrow, SiteRegion } from '../../../../server/libs/shared/src/enums/region.enum';
import { CharacterSearchEntry } from '../../../../server/libs/shared/src/dto/lodestone';
import { QSelect } from 'quasar';

function flat<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}

class Props {
  modelValue = prop<CharacterSearchModel>({
    required: true,
  });
}

const regionDatacenters: string[] = [];
let allowedServersLoaded = false;

@Options({
  emits: ['update:model-value'],
})
export default class CharacterFinderField extends Vue.with(Props) {
  readonly CharacterRegistrationStatus = CharacterRegistrationStatus;

  characterOptions: CharacterSearchModel[] = [];
  characterOptionsSearchString = '';
  registrationStatus: CharacterRegistrationStatus | null = null;

  get hint() {
    if (this.modelValue.server) {
      return '';
    }

    let hint = 'Start typing, and we will attempt to find your character.';

    if (this.$region !== SiteRegion.GLOBAL) {
      hint = `${hint} The character must be in the ${this.$display.regions[this.$region]} region.`;
    }

    return hint;
  }

  async created() {
    if (this.$region !== SiteRegion.GLOBAL && !allowedServersLoaded) {
      try {
        const datacenters = await this.$api.servers.getDatacenters();
        regionDatacenters.push(
          ...datacenters.filter((dc) => dc.region === asRegionOrThrow(this.$region)).map((dc) => dc.name)
        );
        allowedServersLoaded = true;
      } catch (e) {
        notifyError(e);
      }
    }
  }

  async onCharacterFilter(
    value: string,
    update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
    abort: () => void
  ) {
    value = value.trim();

    // require that the name consists of at least two components, each at least two characters long
    if (!/.. ../.exec(value)) {
      this.characterOptions = [];
      update(() => {});
      return;
    }

    try {
      this.characterOptionsSearchString = value;

      // Search in all DCs
      let results: CharacterSearchEntry[];

      if (this.$region === SiteRegion.GLOBAL) {
        results = (await this.$api.lodestone.searchCharacters(value)).List;
      } else {
        const resultsArray = await Promise.all(
          regionDatacenters.map((dcParam) => this.$api.lodestone.searchCharacters(value, dcParam))
        );
        results = flat(resultsArray.map((result) => result.List));
      }

      if (this.characterOptionsSearchString !== value) {
        // Too late
        return;
      }

      this.characterOptions = results.map((result) => ({
        name: result.Name,
        server: result.World,
        avatar: result.Avatar,
        lodestoneId: result.ID,
      }));

      update(() => {});
    } catch (e) {
      abort();
      throw e;
    }
  }

  async onCharacterSelected(character?: CharacterSearchModel) {
    if (character) {
      this.$emit('update:model-value', character);

      this.registrationStatus = (
        await this.$api.characters.getCharacterRegistrationStatus({
          name: character.name,
          lodestoneId: character.lodestoneId,
        })
      ).status;
    }
  }

  clearCharacter() {
    const character: CharacterSearchModel = {
      name: '',
      server: '',
      avatar: '',
      lodestoneId: -1,
    };

    this.registrationStatus = null;
    this.$emit('update:model-value', character);
  }
}
</script>

<style lang="scss">
.character-finder-field__row {
  display: flex;
}

.character-finder-field__inputs {
  flex-basis: 0;
  flex-grow: 1;
}

.character-finder-field__avatar {
  margin-left: 16px;
}

.character-finder-field__avatar img {
  border-radius: 50%;
}

.character-finder-field__alerts .q-banner {
  margin-top: 16px;
}

.character-finder-field__alerts .q-banner p:last-child {
  margin-bottom: 0;
}
</style>
