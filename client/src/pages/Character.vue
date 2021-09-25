<template>
  <q-page class="page-character">
		<template v-if="character && character.name">
			<q-responsive :ratio="590/150" class="page-character__banner">
				<div>Banner</div>
			</q-responsive>
			<p v-if="character.mine">
				<router-link to="/edit-character">Edit profile</router-link>
			</p>
			<header class="page-character__header">
				<div class="layout__filler">
					<q-avatar round>
						<img :src="character.avatar" />
					</q-avatar>
				</div>
				<h2>{{character.name}}</h2>
				<div class="layout__filler"></div>
			</header>
			<q-card>
				<section class="row page-character__details">
					<div class="col-12 col-md-6">
						<table>
							<tr>
								<td>World</td>
								<td>{{character.server}}</td>
							</tr>
							<tr>
								<td>Occupation</td>
								<td>{{character.occupation}}</td>
							</tr>
							<tr>
								<td>Age</td>
								<td>{{character.age}}</td>
							</tr>
						</table>
					</div>
					<div class="col-12 col-md-6">
						<tr>
							<td>Race</td>
							<td>{{$display.races[character.race]}}</td>
						</tr>
						<tr>
							<td>Birthplace</td>
							<td>{{character.birthplace}}</td>
						</tr>
						<tr>
							<td>Residence</td>
							<td>{{character.residence}}</td>
						</tr>
					</div>
				</section>
			</q-card>
			<template v-if="character.appearance">
				<h3>Outward appearance</h3>
				<section class="page-character__appearance-background" v-html="character.appearance">
				</section>
				<template v-if="character.background"><hr /></template>
			</template>
			<template v-if="character.background">
				<h3>Background</h3>
				<section class="page-character__appearance-background" v-html="character.background">
				</section>
			</template>
			<template v-if="!character.appearance && !character.background">
				&nbsp;
			</template>
			<q-card>
				<section class="row page-character__details">
					<div class="col-12 col-md-6">
						<table>
							<tr>
								<td>Title</td>
								<td>{{character.title}}</td>
							</tr>
							<tr>
								<td>Nickname</td>
								<td>{{character.nickname}}</td>
							</tr>
							<tr>
								<td>Motto</td>
								<td>{{character.motto}}</td>
							</tr>
						</table>
					</div>
					<div class="col-12 col-md-6">
						<tr>
							<td>Loves</td>
							<td>{{character.loves}}</td>
						</tr>
						<tr>
							<td>Hates</td>
							<td>{{character.hates}}</td>
						</tr>
						<tr>
							<td>Motivation</td>
							<td>{{character.motivation}}</td>
						</tr>
					</div>
				</section>
			</q-card>
		</template>
		<template v-else-if="notFound">
			<h2>Character not found</h2>
			<p>The character {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import errors from '@app/shared/errors';

export default class PageCharacter extends Vue {
	private name: string|null = null;
	private server: string|null = null;
	private character: CharacterProfileDto|null = null;
	private notFound = false;

	async created() {
		this.server = this.$route.params.server as string;
		this.name = this.$route.params.character as string;

		if (!this.name || !this.server) {
			void this.$router.replace('/');
			return;
		}

		this.name = this.name.replace('_', ' ');

		try {
			this.character = await this.$api.getCharacterProfile(this.name, this.server);
		} catch (e) {
			if (errors.getStatusCode(e) === 404) {
				this.notFound = true;
			} else {
				this.$q.notify({
					type: 'negative',
					message: errors.getMessage(e)
				});
			}
		}
	}
}
</script>

<style lang="scss">
.page-character__banner {
	background: #80a0c0;
	color: white;
	margin-bottom: 16px;
}

.page-character__banner div {
	display: flex;
	align-items: center;
	justify-content: center;
}

.page-character__header {
	display: flex;
}

.page-character__details td {
	padding: 4px 8px;
}

.page-character__details tr > td:first-child {
	font-weight: bold;
}

.page-character__appearance-background {
	margin-bottom: 24px;
}
</style>