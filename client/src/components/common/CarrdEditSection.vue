<template>
  <section class="carrd-edit-section">
    <h6>Carrd integration</h6>
    <p class="text-caption">
      <a href="https://carrd.co/" target="_blank">Carrd <q-icon class="external-link-icon" name="launch" /></a> is a
      service for creating one-page websites. If your {{ entityType }} has a Carrd website, you can add it here, and it
      will be embedded on the page. Otherwise leave this field blank.
    </p>
    <q-checkbox
      v-if="$store.getters.isTrusted"
      v-model="customDomain"
      label="Custom domain"
      @update:modelValue="onCustomDomainChanged"
    />
    <q-input
      v-if="!customDomain"
			ref="inputField"
      v-model="value"
      @update:modelValue="setCarrdProfileLink"
      label="Carrd profile"
      :rules="[(val) => /^[A-Za-z0-9-]*$/.test(val) || 'Copy the part before .carrd.co in your Carrd website address here.']"
    >
      <template v-slot:prepend>
        <q-icon name="link" />
      </template>
      <template v-slot:after>
        <q-select v-model="domain" :options="domainOptions" @update:model-value="setCarrdProfileLink" />
      </template>
    </q-input>
    <q-input
      v-else
			ref="inputField"
      v-model="value"
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
import SharedConstants from '@app/shared/SharedConstants';
import { QField } from 'quasar';
import { Options, prop, Vue } from 'vue-class-component';

const DOMAIN_REGEX = /^([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+$/;
const URL_REGEX = /https:\/\/(([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+)\/?/;
const DEFAULT_DOMAIN = '.carrd.co';

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
  watch: {
    modelValue: function(this: CarrdEditSection) {
      this.parseValue();
    },
  }
})
export default class CarrdEditSection extends Vue.with(Props) {
  readonly DOMAIN_REGEX = DOMAIN_REGEX;
  
  readonly domainOptions = SharedConstants.carrdDomains.map(domain => `.${domain}`);

  value = '';
  domain = DEFAULT_DOMAIN;
  customDomain = false;

  created() {
    this.parseValue();
  }

  private parseValue() {
    if (!this.modelValue) {
      this.value = '';
      this.domain = DEFAULT_DOMAIN;
      return;
    }

    const indexOfDot = this.modelValue.indexOf('.');
    const value = this.modelValue.substring(0, indexOfDot);
    const domain = this.modelValue.substring(indexOfDot);

    if (this.$store.getters.isTrusted && domain && !this.domainOptions.includes(domain)) {
      this.customDomain = true;
      this.value = this.modelValue;
    } else {
      this.customDomain = false;
      this.value = value;
      this.domain = domain || DEFAULT_DOMAIN;
    }
  }
  
	onCustomDomainChanged() {
		void this.$nextTick(() => void (this.$refs.inputField as QField).validate());
	}

  setCarrdProfileLink() {
    const value = this.value.trim();
    const urlMatch = URL_REGEX.exec(value);

    if (urlMatch) {
      this.$emit('update:model-value', urlMatch[1]);
    } else if (this.customDomain) {
      this.$emit('update:model-value', value);
    } else if (value !== '') {
      this.$emit('update:model-value', value + this.domain);
    } else {
      this.$emit('update:model-value', '');
    }
  }
}
</script>

<style type="text-css"></style>
