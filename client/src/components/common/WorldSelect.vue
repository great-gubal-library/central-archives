<template>
  <q-select
    label="World"
    icon="public"
    class="world-select"
    :model-value="modelValue"
    :options="serverOptions"
    emit-value
    map-options
    v-bind="$attrs"
    @update:model-value="onUpdateModelValue"
  >
    <template v-slot:prepend>
      <q-icon name="public" />
    </template>
    <template v-slot:option="scope">
      <q-item v-if="!scope.opt.group" v-bind="scope.itemProps" v-on="scope.itemEvents">
        <q-item-section>
          <q-item-label v-html="scope.opt.label"></q-item-label>
          <q-item-label caption>{{ scope.opt.description }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-else class="world-select__group" v-bind="scope.itemProps" v-on="scope.itemEvents">
        <q-item-label header>{{ scope.opt.group }}</q-item-label>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component';
import SharedConstants from '@app/shared/SharedConstants';

interface OptionInterface {
  label: string;
  value: string;
}

interface OptionGroupInterface {
  group: string;
  disable: boolean;
}

class Props {
  modelValue = prop<string>({
    default: null,
  });
}

@Options({
  name: 'WorldSelect',
  emits: ['update:model-value'],
})
export default class WorldSelect extends Vue.with(Props) {
  serverOptions: (OptionInterface | OptionGroupInterface)[] = [];

  created() {
		const allowedServers: { [ k: string ]: string[] } = SharedConstants.ALLOWED_SERVERS;
		const serverOptions: (OptionInterface | OptionGroupInterface)[] = [];

		for (const dc of Object.keys(allowedServers)) {
			serverOptions.push({
				group: dc,
				disable: true,
			});
			
			for (const server of allowedServers[dc]) {
				serverOptions.push({
					label: server,
					value: server,
				});
			}
		}

    this.serverOptions = serverOptions;
  }

  onUpdateModelValue(val: string) {
    this.$emit('update:model-value', val);
  }
}
</script>

<style lang="scss">
.world-select__group {
	background: #e0e0e0;
}

.world-select__group .q-item__label {
	padding-left: 0;
	font-weight: bold;
	color: black;
}
</style>
