<script setup lang="ts">
import { computed } from 'vue';
import { generateQuickGuid } from './mixins'

const props = defineProps<{
  modelValue: boolean;
  label?: string;
  fontSize?: string;
  tooltip?: string;
  disabled?: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update', value: boolean): void
  (e: 'blur'): void
}>()

const value = computed({
  get(): boolean {
    return props.modelValue;
  },
  set(val: boolean): void {
    emit("update:modelValue", val);
  }
})
const uuid = generateQuickGuid();

</script>

<template>
  <div class="checkbox-input-wrapper" :class="{ disabled }" :title="tooltip" :style="{
      fontSize: fontSize || '12px'
    }">
    <input type="checkbox" tabindex="0" :disabled="disabled" :value="modelValue" :checked="modelValue"
      @input="value = !value" @blur="$emit('blur')" :id="uuid" :name="uuid">
    <label :for="uuid" tabindex="0">{{ props.label }}</label>
  </div>
</template>

<style>
.checkbox-input-wrapper {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: center;
  font-family: "Open Sans", sans-serif;
  font-size: 12px;
  margin: 3px 3px 7px 0px;
  width: fit-content;
}

.checkbox-input-wrapper input[type="checkbox"] {
  color: var(--color-checkbox);
  outline: 0;
}

.checkbox-input-wrapper,
.checkbox-input-wrapper * {
  cursor: pointer;
}

.checkbox-input-wrapper label {
  margin-left: 6px;
  user-select: none;
  margin-top: -1px;
}

input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  margin: 0;
  font: inherit;
  color: currentColor;
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid currentColor;
  border-radius: 0.15em;
  display: grid;
  place-content: center;
}

input[type="checkbox"]::before {
  content: "";
  width: .875em;
  height: .875em;
  clip-path: polygon(2px 2px, 8.5px 2px, 8.5px 8.5px, 2px 8.5px);
  transform: scale(0);
  transform-origin: center;
  transition: 30ms transform var(--quad);
  box-shadow: inset 1em 1em var(--color-checkbox);
}

input[type="checkbox"]:checked::before {
  transform: scale(1.1);
}

.checkbox-input-wrapper:hover input,
.checkbox-input-wrapper:hover label,
.checkbox-input-wrapper:hover input[type="checkbox"]:checked::before {
  color: var(--color-checkbox-hover);
}

.checkbox-input-wrapper:hover input[type="checkbox"]::before {
  box-shadow: inset 1em 1em var(--color-checkbox-hover);
}

.checkbox-input-wrapper:hover label {
  color: var(--color-checkbox-hover);
  opacity: 1;
}

.checkbox-input-wrapper:not(:hover) input[type="checkbox"]:focus {
  /* outline: max(2px, 0.15em) solid var(--color-selection); */
  outline-offset: max(2px, 0.15em);
}

input[type="checkbox"]:focus+label {
  color: var(--color-selection);
}

input[type="checkbox"]:disabled {
  color: var(--checkbox-disabled);
  cursor: not-allowed;
}

.checkbox-input-wrapper.disabled,
.checkbox-input-wrapper.disabled input[type="checkbox"] {
  opacity: 0.5;
  pointer-events: none;
}
</style>