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
          <q-item-label>{{ scope.opt.label }}</q-item-label>
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
import { SiteRegion } from '@app/shared/enums/region.enum';
import { notifyError } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

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

const serverOptions: (OptionInterface | OptionGroupInterface)[] = [];
let serverOptionsLoaded = false;

@Options({
  name: 'WorldSelect',
  emits: ['update:model-value'],
})
export default class WorldSelect extends Vue.with(Props) {
  readonly serverOptions: (OptionInterface | OptionGroupInterface)[] = [];

  async created() {
    if (!serverOptionsLoaded) {
      try {
        let datacenters = await this.$api.servers.getDatacenters();

        if (this.$region !== SiteRegion.GLOBAL) {
          datacenters = datacenters.filter(dc => dc.region as string === this.$region as string);
        }

        datacenters.forEach(dc => {
          serverOptions.push({
            group: dc.name,
            disable: true,
          });

          dc.servers.forEach(server => {
            serverOptions.push({
              label: server,
              value: server,
            });
          });
        });

        serverOptionsLoaded = true;
      } catch (e) {
        notifyError(e);
      }
    }

    this.serverOptions.push(...serverOptions);
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
