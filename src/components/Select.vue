<template>
  <div class="relative">
    <select
      :id="inputId"
      :name="name"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :class="selectClass"
      @input="onInput"
      @change="onChange"
    class="rounded-md"
    >
      <option v-if="placeholder" value="" disabled selected>
        {{ placeholder }}
      </option>
      <option
        v-for="(option, index) in normalizedOptions"
        :key="index"
        :value="getOptionValue(option)"
        :disabled="'disabled' in option ? option.disabled : false"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>

    <span v-if="leadingIcon" class="absolute inset-y-0 left-0 flex items-center pl-3">
      <span :class="iconClass">{{ leadingIcon }}</span>
    </span>

    <span v-if="trailingIcon" class="absolute inset-y-0 right-0 flex items-center pr-3">
      <span :class="iconClass">{{ trailingIcon }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  optionValue: 'value'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const inputId = computed(() => props.id || `select-${Math.random().toString(36).substr(2, 9)}`)

const selectClass = computed(() => {
  const base = 'block w-full appearance-none focus:outline-none focus:ring-1'
  const sizes = {
    sm: 'py-1.5 px-2.5 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-2.5 px-4 text-lg'
  }
  const variants = {
    outline: `border bg-transparent ${props.disabled ? 'border-gray-200' : 'border-gray-300 hover:border-gray-400'} focus:ring-${props.color}-500 focus:border-${props.color}-500`,
    solid: `border border-transparent bg-${props.color}-100 text-${props.color}-800 focus:ring-${props.color}-500`
  }
  const icons = {
    left: props.leadingIcon ? 'pl-10' : '',
    right: props.trailingIcon ? 'pr-10' : ''
  }
  
  return [
    base,
    sizes[props.size],
    variants[props.variant],
    icons.left,
    icons.right,
    props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  ].join(' ')
})

const iconClass = computed(() => [
  'text-gray-400',
  props.size === 'sm' ? 'text-sm' : props.size === 'lg' ? 'text-lg' : 'text-base'
].join(' '))

const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        [props.optionValue]: option,
        [props.optionLabel]: option
      }
    }
    return option
  })
})

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}

function onChange(event: Event) {
  emit('change', (event.target as HTMLSelectElement).value)
}

function getOptionValue(option: string | number | Option) {
  return typeof option === 'object' ? option[props.optionValue] : option
}

function getOptionLabel(option: string | number | Option) {
  return typeof option === 'object' ? option[props.optionLabel] : option
}
</script>