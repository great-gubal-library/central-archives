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
					emit-value
					input-debounce="200"
					label="Character name"
					:hint="modelValue.server ? '' : 'Start typing, and we will attempt to find your character.'"
					@filter="onCharacterFilter"
					@update:model-value="onCharacterSelected"
					:rules="[
						val => !!val && !!val.server || 'You must select a character.',
					]"
				>
					<template v-slot:prepend>
						<q-icon name="face" />
					</template>
					<template v-slot:append>
						<q-btn v-if="modelValue.server" flat dense icon="delete" title="Clear" @click="clearCharacter" />
					</template>
				</q-select>
				<q-input :model-value="modelValue.server" label="Server" readonly>
					<template v-slot:prepend>
						<q-icon name="computer" />
					</template>
				</q-input>
			</div>
			<div class="character-finder-field__avatar">
				<q-img width="96px" height="96px" :src="modelValue.avatar" />
			</div>
		</div>
		<div class="character-finder-field__alerts" v-if="registrationStatus">
			<q-banner v-if="registrationStatus === CharacterRegistrationStatus.CLAIMED_BY_ANOTHER_USER" class="bg-negative text-white">
				This character has already been claimed by another user.
			</q-banner>
			<q-banner v-else-if="registrationStatus === CharacterRegistrationStatus.ALREADY_REGISTERED" class="bg-negative text-white">
				You have already registered this character.
			</q-banner>
			<q-banner v-else-if="registrationStatus === CharacterRegistrationStatus.RENAMED" class="bg-dark text-white">
				<p>
					You have renamed this character in-game, and you have a Chaos Archives character profile under the old name. You still <strong>can</strong> register a separate character profile for the new name; however, you will no longer be able to rename the old character on Chaos Archives to match the new name.
				</p>
				<p>
					If you would rather update your existing character profile to the new name, open your existing character profile and click “Refresh from Lodestone”.
				</p>
			</q-banner>
		</div>
	</div>
</template>

<script lang="ts">
import { CharacterRegistrationStatus } from '@app/shared/enums/character-registration-status.enum';
import SharedConstants from '@app/shared/SharedConstants';
import minXIVAPI from 'src/common/xivapi-min';
import { Options, prop, Vue } from 'vue-class-component';
import { CharacterSearchModel } from './character-search-model';

// Datacenter name in parentheses: (Chaos)
const SERVER_SUFFIX = `(${SharedConstants.DATACENTER})`;

class Props {
	modelValue = prop<CharacterSearchModel>({
		required: true
	});
}

@Options({
	emits: [ 'update:model-value' ]
})
export default class CharacterFinderField extends Vue.with(Props) {
	readonly CharacterRegistrationStatus = CharacterRegistrationStatus;

	characterOptions: CharacterSearchModel[] = [];
  characterOptionsSearchString = '';
	registrationStatus: CharacterRegistrationStatus | null = null;

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
        lodestoneId: result.ID,
      }));
      
      update();
    } catch (e) {
      abort();
      throw e;
    }
	}

  async onCharacterSelected(character?: CharacterSearchModel) {
    if (character) {
      this.$emit('update:model-value', character);

			this.registrationStatus = (await this.$api.characters.getCharacterRegistrationStatus({
				name: character.name,
				lodestoneId: character.lodestoneId,
			})).status;
    }
  }

  clearCharacter() {
		const character: CharacterSearchModel = {
			name: '',
			server: '',
			avatar: '',
			lodestoneId: -1
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
