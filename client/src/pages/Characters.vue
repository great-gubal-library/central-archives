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
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $q = useQuasar();

async function load(): Promise<NewProfileDto[]> {
	try {
		return await $api.getCharacterProfiles();
	} catch (e) {
		$q.notify({
			type: 'negative',
			message: errors.getMessage(e)
		});
		throw e;
	}
}

@Options({
	components: {
		NewProfileList
	},
	async beforeRouteEnter(_, __, next) {
		const stories = await load();
		next(vm => (vm as PageCharacters).setContent(stories));
	}
})
export default class PageCharacters extends Vue {
	profiles: NewProfileDto[] = [];

	setContent(profiles: NewProfileDto[]) {
		this.profiles = profiles;
	}
}
</script>

<style lang="scss">

</style>