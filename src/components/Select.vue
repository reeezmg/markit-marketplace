<template>
  <div ref="rootEl" class="relative">
    <button
      :id="inputId"
      type="button"
      :name="name"
      :disabled="disabled"
      :class="selectClass"
      @click="toggleOpen"
    >
      <span v-if="leadingIcon" class="select-icon-left">{{ leadingIcon }}</span>
      <span :class="displayClass">{{ selectedLabel }}</span>
      <span class="select-chevron-wrap" aria-hidden="true">
        <svg
          class="select-chevron"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <div
      v-if="open"
      class="select-menu"
      role="listbox"
      :aria-labelledby="inputId"
    >
      <button
        v-for="(option, index) in normalizedOptions"
        :key="index"
        type="button"
        class="select-option"
        :class="{ 'is-selected': isSelected(option) }"
        :disabled="'disabled' in option ? option.disabled : false"
        @click="onSelectOption(option)"
      >
        {{ getOptionLabel(option) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'

interface Option {
  [key: string]: any
  disabled?: boolean
}

interface Props {
  modelValue?: string | number | object | null
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  leadingIcon?: string
  trailingIcon?: string
  options?: Array<string | number | Option>
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  variant?: 'outline' | 'solid'
  optionLabel?: string
  optionValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  id: '',
  name: '',
  placeholder: '',
  required: false,
  disabled: false,
  leadingIcon: '',
  trailingIcon: '',
  options: () => [],
  size: 'md',
  color: 'primary',
  variant: 'outline',
  optionLabel: 'label',
  optionValue: 'value',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const inputId = computed(() => props.id || `select-${Math.random().toString(36).slice(2, 11)}`)

const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        [props.optionValue]: option,
        [props.optionLabel]: option,
      }
    }
    return option
  })
})

const selectedLabel = computed(() => {
  const selected = normalizedOptions.value.find(option => String(getOptionValue(option)) === String(props.modelValue))
  if (selected) return String(getOptionLabel(selected))
  return props.placeholder || 'Select'
})

const displayClass = computed(() => {
  const hasValue = normalizedOptions.value.some(option => String(getOptionValue(option)) === String(props.modelValue))
  return hasValue ? 'select-text' : 'select-placeholder'
})

const selectClass = computed(() => {
  const sizes = {
    sm: 'select-btn-sm',
    md: 'select-btn-md',
    lg: 'select-btn-lg',
  }
  return [
    'select-btn',
    sizes[props.size],
    props.disabled ? 'is-disabled' : '',
    open.value ? 'is-open' : '',
  ].join(' ')
})

function getOptionValue(option: string | number | Option) {
  return typeof option === 'object' ? option[props.optionValue] : option
}

function getOptionLabel(option: string | number | Option) {
  return typeof option === 'object' ? option[props.optionLabel] : option
}

function isSelected(option: string | number | Option) {
  return String(getOptionValue(option)) === String(props.modelValue)
}

function onSelectOption(option: string | number | Option) {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', value)
  open.value = false
}

function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent) {
  if (!rootEl.value) return
  const target = event.target as Node
  if (!rootEl.value.contains(target)) open.value = false
}

onIonViewWillEnter(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<style scoped>
.select-btn {
  position: relative;
  width: 100%;
  border: 1px solid var(--markit-border);
  border-radius: 12px;
  background: var(--markit-surface);
  color: var(--markit-text);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
}

.select-btn:hover {
  border-color: color-mix(in srgb, var(--ion-color-primary) 35%, var(--markit-border));
}

.select-btn.is-open {
  border-color: color-mix(in srgb, var(--ion-color-primary) 55%, var(--markit-border));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ion-color-primary) 15%, transparent);
}

.select-btn.is-disabled {
  opacity: .6;
  cursor: not-allowed;
}

.select-btn-sm {
  min-height: 36px;
  padding: 8px 34px 8px 10px;
  font-size: .9rem;
}

.select-btn-md {
  min-height: 44px;
  padding: 10px 38px 10px 12px;
  font-size: 1rem;
}

.select-btn-lg {
  min-height: 50px;
  padding: 12px 40px 12px 14px;
  font-size: 1.05rem;
}

.select-placeholder {
  color: var(--markit-text-muted);
  text-align: left;
  flex: 1;
}

.select-text {
  color: var(--markit-text);
  text-align: left;
  flex: 1;
}

.select-icon-left {
  color: var(--markit-text-muted);
}

.select-chevron-wrap {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.select-chevron {
  width: 16px;
  height: 16px;
  color: var(--markit-text-muted);
  transition: transform .2s ease;
}

.select-btn.is-open .select-chevron {
  transform: rotate(180deg);
}

.select-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  z-index: 40;
  border: 1px solid var(--markit-border);
  border-radius: 12px;
  background: var(--markit-surface);
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .10);
}

.select-option {
  width: 100%;
  text-align: left;
  padding: 11px 12px;
  color: var(--markit-text);
  background: transparent;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--markit-border) 60%, transparent);
  transition: background-color .18s ease, color .18s ease;
}

.select-option:last-child {
  border-bottom: 0;
}

.select-option:hover {
  background: color-mix(in srgb, var(--ion-color-primary) 8%, #ffffff);
}

.select-option.is-selected {
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  color: var(--ion-color-primary);
  font-weight: 600;
}
</style>
