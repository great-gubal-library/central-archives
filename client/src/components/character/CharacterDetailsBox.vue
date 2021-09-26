<template>
	<q-card>
		<section class="character-details-box__content">
			<slot />
		</section>
	</q-card>
</template>


<script lang="ts">
import { Vue } from 'vue-class-component';

export default class CharacterDetailsBox extends Vue {
  
}
</script>

<style lang="scss">
.character-details-box__content {
	display: flex;
	flex-wrap: wrap;
}
</style>
