<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="switch-character-dialog">
      <h5>Switch Character</h5>
      <character-name-list
        class="switch-character-dialog__character-list"
        :profiles="characters"
        :links="false"
				:activeName="activeName"
				:activeServer="activeServer"
        @select="onCharacterSelect"
      />
      <q-card-actions class="switch-character-dialog__buttons">
        <q-btn flat color="primary" label="Close" @click="onCloseClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { notifySuccess } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';
import CharacterNameList from '../common/CharacterNameList.vue';
import { Region } from '../../../../server/libs/shared/src/enums/region.enum';

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
	name: 'SwitchCharacterDialog',
  components: {
    CharacterNameList,
  },
  emits: ['ok', 'hide'],
})
export default class SwitchCharacterDialog extends Vue {
  characters: SessionCharacterDto[] = [];

  created() {
    this.$store.state.user!.characters.forEach((character) => {
      if (character.region === Region.EU) {
        this.characters.push(character);
      }
    });
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

	get activeName() {
		return this.$store.getters.character?.name;
	}

	get activeServer() {
		return this.$store.getters.character?.server;
	}

  onCharacterSelect(character: SessionCharacterDto) {
    const oldCharacterId = this.$store.getters.characterId;
    this.$store.commit('setCurrentCharacterId', character.id);
    this.$emit('ok', character);
    this.hide();

    if (character.id !== oldCharacterId) {
      notifySuccess(`${character.name} is now your active character.`);
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

.switch-character-dialog__character-list.character-name-list .q-item {
  background: white;
}

.switch-character-dialog__character-list.character-name-list .q-item.character-name-list__item_active {
  background: $striped-list-bg-even;
}

.switch-character-dialog__buttons {
  justify-content: end;
}

@media (min-width: 1280px) {
  .q-dialog__inner--minimized > .switch-character-dialog {
    max-width: 800px;
  }
}
</style>
