<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="switch-character-dialog">
      <h5>Switch Character</h5>
      <character-name-list class="switch-character-dialog__character-list" :profiles="characters" :links="false" @select="onCharacterSelect" />
      <q-card-actions class="switch-character-dialog__buttons">
        <q-btn flat color="secondary" icon="add" label="Add Character" @click="onAddCharacterClick" />
        <q-btn flat color="primary" label="Close" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { Options, Vue } from 'vue-class-component';
import CharacterNameList from '../mainpage/CharacterNameList.vue';

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
  components: {
    CharacterNameList,
  },
  emits: ['ok', 'hide'],
})
export default class ConfirmImageDeleteDialog extends Vue {
  characters: SessionCharacterDto[] = [];

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

  onAddCharacterClick() {}

  onCancelClick() {
    this.hide();
  }
}
</script>

<style lang="scss">
.switch-character-dialog {
  width: 800px;
  padding: 8px 24px;
}

.switch-character-dialog__character-list {
  display: flex;
	justify-content: stretch;
}

.switch-character-dialog__character-list > * {
  flex-basis: 0;
  flex-grow: 0.5;
	min-width: 200px;
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
