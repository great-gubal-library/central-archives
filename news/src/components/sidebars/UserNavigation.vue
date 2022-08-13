<template>
	<nav class="user-navigation" v-show="issues.length">
		<div class="user-navigation__label">
			<template v-if="!$store.getters.characterId">
				<q-icon name="account_circle" size="36px" title="Not logged in" />
			</template>
			<template v-else>
				<q-avatar v-if="$store.getters.character" round size="36px" :title="$store.getters.character.name">
					<img :src="$store.getters.character.avatar" />
				</q-avatar>
			</template>
		</div>
		<q-list bordered separator flat>
			<template v-if="!$store.getters.characterId">
				<q-item clickable v-ripple to="/login">
					<q-icon name="login" size="36px" title="Log in" />
				</q-item>
			</template>
			<template v-else>
				<q-item clickable v-ripple @click="switchCharacter">
					<q-icon name="switch_account" size="36px" title="Switch character" />
				</q-item>
				<template v-if="$store.getters.character?.verified">
					<q-item clickable v-ripple to="/create-article">
						<q-icon name="add" size="36px" title="Submit new article" />
					</q-item>
					<q-item clickable v-ripple to="/my-articles">
						<q-icon name="list_alt" size="36px" title="My articles" />
					</q-item>
					<q-item v-if="$store.getters.character?.newsRole === NewsRole.EDITOR" clickable v-ripple to="/submitted">
						<q-icon name="checklist" size="36px" title="Submitted articles" />
					</q-item>
				</template>
				<q-item clickable v-ripple @click="logOut">
					<q-icon name="logout" size="36px" title="Log out" />
				</q-item>
			</template>
		</q-list>
	</nav>
</template>

<script lang="ts">
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { NewsRole } from '@app/shared/enums/news-role.enum';
import { notifySuccess } from 'src/common/notify';
import { Vue } from 'vue-class-component';

export default class UserNavigation extends Vue {
	readonly NewsRole = NewsRole;

	issues: number[] = [];

	async created() {
		this.issues = await this.$api.news.getIssues();
	}

  async switchCharacter() {
    const SwitchCharacterDialog = (await import('./SwitchCharacterDialog.vue')).default;

    this.$q.dialog({
      component: SwitchCharacterDialog
    }).onOk((character: SessionCharacterDto) => {
      if (character.verified) {
        void this.$router.push('/');
      } else {
        void this.$router.push('/verify');
      }
    });
  }

	logOut() {
    this.$store.commit('setUser', null);
    this.$api.setAccessToken(null);
    notifySuccess('You have been logged out.');
    void this.$router.push('/');
  }
}
</script>

<style lang="scss">
.user-navigation {
	position: fixed;
	left: 20px;
	top: 20px;
}

.user-navigation__label {
	text-align: center;
	margin-bottom: 8px;
}

.user-navigation .q-item {
	padding: 8px;
	color: #559;
}
</style>