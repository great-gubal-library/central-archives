<template>
  <Teleport :to="to" v-if="isMounted"><slot></slot></Teleport>
</template>

<script lang="ts">
import { prop, Vue } from 'vue-class-component';

class Props {
	to = prop<string>({
		required: true
	});
}

export default class MountedTeleport extends Vue.with(Props) {
  isMounted = false;

	mounted() {
		this.isMounted = true;
	}
}
</script>
