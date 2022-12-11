<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="refresh-character-dialog">
			<q-card-section>
				<h5>Aktualisierung bestätigen</h5>
				<p>
					Dies wird den neuen Charakternamen, das neue Volk und den neuen Server von
					<strong>{{ characterName }}</strong> via Lodestone abfragen und entsprechend anpassen.
				</p>
				<p><strong>Dieser Vorgang kann nicht rückgängig gemacht werden.</strong></p>
				<p>Fortfahren?</p>
			</q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Abbrechen" @click="onCancelClick" />
        <q-btn flat color="negative" label="Bestätigen" @click="onProceedClick" />
      </q-card-actions>
			<q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
  characterId = prop<number>({
    required: true,
  });

  characterName = prop<string>({
    required: true,
  });
}

@Options({
  name: 'RefreshCharacterDialog',
  emits: ['ok', 'hide'],
})
export default class RefreshCharacterDialog extends Vue.with(Props) {
	loading = false;

  show() {
    (this.$refs.dialog as DialogRef).show();
  }

  hide() {
    (this.$refs.dialog as DialogRef).hide();
  }

  onDialogHide() {
    this.$emit('hide');
  }

  onCancelClick() {
    this.hide();
  }

  async onProceedClick() {
		this.loading = true;

		try {
			const result = await this.$api.characters.refreshCharacter({ id: this.characterId });
			const characterId = this.$store.getters.characterId;

			if (characterId && this.characterId === characterId) {
				this.$store.commit('updateCharacter', result);
			}

			notifySuccess('Charakterdaten aktualisiert.');
			this.$emit('ok', result);
			this.hide();
		} catch (e) {
			notifyError(e);
		} finally {
			this.loading = false;
		}
  }
}
</script>

<style lang="scss">
</style>
