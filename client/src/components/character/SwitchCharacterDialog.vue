<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="switch-character-dialog">
      <h5>Switch Character</h5>
      <character-name-list class="switch-character-dialog__character-list" :profiles="characters" :links="false" @select="onCharacterSelect" />
			<q-slide-transition>
				<q-form v-if="adding" @submit="onAddCharacterSubmit">
					<h6>Add character to account</h6>
					<character-finder-field v-model="newCharacter" />
					<q-card-actions align="right" class="switch-character-dialog__add-form-buttons">
						<q-btn flat color="secondary" label="Cancel" @click="onAddCharacterCancelClick" />
						<q-btn color="primary" label="Add character" type="submit" :disable="newCharacter.lodestoneId === -1" />
					</q-card-actions>
				</q-form>
			</q-slide-transition>
      <q-card-actions class="switch-character-dialog__buttons" v-if="!adding">
				<q-btn flat color="secondary" icon="add" label="Add Character" @click="onAddCharacterClick" />
        <q-btn flat color="primary" label="Close" @click="onCloseClick" />
      </q-card-actions>
			<q-inner-loading :showing="submitting" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import errors from '@app/shared/errors';
import { Options, Vue } from 'vue-class-component';
import CharacterNameList from '../mainpage/CharacterNameList.vue';
import { CharacterSearchModel } from './character-search-model';
import CharacterFinderField from './CharacterFinderField.vue';

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
  components: {
    CharacterNameList,
		CharacterFinderField,
  },
  emits: ['ok', 'hide'],
})
export default class ConfirmImageDeleteDialog extends Vue {
  characters: SessionCharacterDto[] = [];

	newCharacter: CharacterSearchModel = {
		name: '',
		server: '',
		avatar: '',
		lodestoneId: -1,
	};

	adding = false;
	submitting = false;

  created() {
    this.$store.state.user!.characters.forEach((character) => this.characters.push(character));
  }

  show() {
    (this.$refs.dialog as DialogRef).show();
  }

  hide() {
    (this.$refs.dialog as DialogRef).hide();
  }

  onDialogHide() {
    this.$emit('hide');
  }

	onCharacterSelect(character: SessionCharacterDto) {
		this.$store.commit('setCurrentCharacterId', character.id);
		this.$emit('ok', character);
		this.hide();
	}

  onAddCharacterClick() {
		this.adding = true;
	}

  onAddCharacterCancelClick() {
		this.adding = false;
	}

	async onAddCharacterSubmit() {
		this.submitting = true;

		try {
			const character = await this.$api.characters.addAccountCharacter({ lodestoneId: this.newCharacter.lodestoneId });

			this.$q.notify({
        message: 'Character added successfully. You will need to verify it.',
        type: 'positive'
      });

			this.$store.commit('addCharacter', character);
			this.onCharacterSelect(character);
		} catch (e) {
			this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative'
      });
		} finally {
			this.submitting = false;
		}
	}

  onCloseClick() {
    this.hide();
  }
}
</script>

<style lang="scss">
.switch-character-dialog {
  width: 800px;
  padding: 8px 24px;
}

.switch-character-dialog__character-list > * {
	display: inline-flex;
  width: 50%;
	min-width: 200px;
}

.switch-character-dialog__add-form-buttons {
	margin-top: 8px;
}

.switch-character-dialog__buttons {
  justify-content: space-between;
}

@media (min-width: 1280px) {
  .q-dialog__inner--minimized > .switch-character-dialog {
    max-width: 800px;
  }
}
</style>
