<template>
	<div class="free-company-crest">
		<img v-for="image in images" :key="image" :src="image" />
	</div>
</template>

<script>
import { prop, Vue, Options } from 'vue-class-component';

class Props {
	images = prop<Array>({
		required: true
	});
}

@Options({
	name: 'FreeCompanyCrest'
})
export default class FreeCompanyCrest extends Vue.with(Props) {
	
}
</script>

<style lang="scss">
.free-company-crest {
	position: relative;
	width: 40px;
	height: 40px;
}

.free-company-crest img {
	position: absolute;
	left: 0;
	top: 0;
	width: 40px;
	height: 40px;
}
</style>
