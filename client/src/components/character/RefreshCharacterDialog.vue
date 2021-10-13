<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="refresh-character-dialog">
			<q-card-section>
				<h5>Confirm Refresh from Lodestone</h5>
				<p>
					This will query your new character name, race, and server for
					<strong>{{ characterName }}</strong> from Lodestone and change them if they changed
					in-game.
				</p>
				<p><strong>This action cannot be undone.</strong></p>
				<p>Proceed?</p>
			</q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
        <q-btn flat color="negative" label="Proceed" @click="onProceedClick" />
      </q-card-actions>
			<q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import errors from '@app/shared/errors';
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
	private loading = false;

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
			const result = await this.$api.refreshCharacter({ id: this.characterId });
			const user = this.$store.state.user;

			if (user && this.characterId === user.character.id) {
				this.$store.commit('updateCharacter', result);
			}

			this.$q.notify({
        message: 'Character data refreshed.',
        type: 'positive',
      });

			this.$emit('ok', result);
			this.hide();
		} catch (e) {
			this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative',
      });
		} finally {
			this.loading = false;
		}
  }
}
</script>

<style lang="scss">
</style>