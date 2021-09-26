<template>
  <q-page class="page-characters">
		<h2>People of the Realm</h2>
		<new-profile-list :profiles="profiles" />
	</q-page>	
</template>

<script lang="ts">
import { NewProfileDto } from '@app/shared/dto/main-page/new-profile.dto';
import errors from '@app/shared/errors';
import NewProfileList from 'components/mainpage/NewProfileList.vue';
import { Options, Vue } from 'vue-class-component';

@Options({
	components: {
		NewProfileList
	}
})
export default class PageCharacters extends Vue {
	private profiles: NewProfileDto[] = [];

	async created() {
		try {
			this.profiles = await this.$api.getCharacterProfiles();
		} catch (e) {
			this.$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		}
	}
}
</script>

<style lang="scss">

</style>