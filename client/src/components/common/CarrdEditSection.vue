<template>
  <section class="carrd-edit-section">
    <h6>Carrd integration</h6>
    <p class="text-caption">
      <a href="https://carrd.co/" target="_blank">Carrd <q-icon class="external-link-icon" name="launch" /></a> is a
      service for creating one-page websites. If your {{ entityType }} has a Carrd website, you can add it here, and it
      will be embedded on the page. Otherwise leave this field blank.
    </p>
    <q-checkbox
      v-if="isTrusted"
      v-model="customDomain"
      label="Custom domain"
      @update:modelValue="onCustomDomainChanged"
    />
    <q-input
      v-if="!customDomain"
			ref="inputField"
      :modelValue="modelValue"
      @update:modelValue="setCarrdProfileLink"
      label="Carrd profile"
      :rules="[(val) => /^[A-Za-z0-9-]*$/.test(val) || 'Copy the part before .carrd.co in your Carrd website address here.']"
    >
      <template v-slot:prepend>
        <q-icon name="link" />
      </template>
      <template v-slot:after> .carrd.co </template>
    </q-input>
    <q-input
      v-else
			ref="inputField"
      :modelValue="modelValue"
      @update:modelValue="setCarrdProfileLink"
      label="Carrd profile"
      :rules="[(val) => DOMAIN_REGEX.test(val) || 'Copy your Carrd website URL here.']"
    >
      <template v-slot:prepend>
        <q-icon name="link" />
      </template>
    </q-input>
  </section>
</template>

<script lang="ts">
import { Role, roleImplies } from '@app/shared/enums/role.enum';
import { QField } from 'quasar';
import { Options, prop, Vue } from 'vue-class-component';

const DOMAIN_REGEX = /^([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+$/;
const CARRD_REGEX = /https:\/\/([^.]+)\.carrd\.co/;
const URL_REGEX = /https:\/\/(([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+)\/?/;

class Props {
  modelValue = prop<string>({
    required: true,
  });

  entityType = prop<string>({
    required: true,
  });
}

@Options({
  name: 'CarrdEditSection',
  emits: ['update:model-value'],
})
export default class CarrdEditSection extends Vue.with(Props) {
  DOMAIN_REGEX = DOMAIN_REGEX;

  customDomain = false;

  created() {
    if (DOMAIN_REGEX.test(this.modelValue) && this.isTrusted) {
      this.customDomain = true;
    }
  }

  get isTrusted(): boolean {
    return roleImplies(this.$store.getters.role!, Role.TRUSTED);
  }

	onCustomDomainChanged() {
		void this.$nextTick(() => void (this.$refs.inputField as QField).validate());
	}

  setCarrdProfileLink(newValue: string) {
    const regex = this.customDomain ? URL_REGEX : CARRD_REGEX;
    const urlMatch = regex.exec(newValue);
    this.$emit('update:model-value', !urlMatch ? newValue : urlMatch[1]);
  }
}
</script>

<style type="text-css"></style>
