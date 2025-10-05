<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue';

const props = defineProps<{
  as?: string
  label?: string | number
  color?: 'primary' | 'secondary' | 'gray' | 'danger' | 'success'
  variant?: 'solid' | 'outline' | 'subtle'
  size?: 'sm' | 'md' | 'lg' | 'xs'
  square?: boolean
  class?: any
  avatar?: {
    src: string
    alt?: string
  }
  leadingIcon?: string
  trailingIcon?: string
}>()

const tag = computed(() => props.as || 'span')

const baseClasses = computed(() => {
  const sizeMap = {
    xs: 'text-[8px]/3 px-1 py-0.5 gap-1 rounded-sm',
    sm: 'text-[10px]/3 px-1.5 py-1 gap-1 rounded-sm',
    md: 'text-xs px-2 py-1 gap-1 rounded-md',
    lg: 'text-sm px-2 py-1 gap-1.5 rounded-md',
    xl: 'text-base px-2.5 py-1 gap-1.5 rounded-md'
  }

  const variantMap: Record<string, Record<string, string>> = {
    solid: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      danger: 'bg-red-500 text-white',
      success: 'bg-green-500 text-white',
      gray: 'bg-gray-300 text-black'
    },
    outline: {
      primary: 'border border-blue-500 text-blue-500',
      secondary: 'border border-gray-500 text-gray-500',
      danger: 'border border-red-500 text-red-500',
      success: 'border border-green-500 text-green-500',
      gray: 'border border-gray-400 text-gray-600'
    },
    subtle: {
      primary: 'bg-blue-100 text-blue-700',
      secondary: 'bg-gray-100 text-gray-700',
      danger: 'bg-red-100 text-red-700',
      success: 'bg-green-100 text-green-700',
      gray: 'bg-gray-100 text-gray-700'
    }
  }

  const variant = props.variant || 'solid'
  const color = props.color || 'primary'
  const size = sizeMap[props.size || 'md']
  const shape = props.square ? 'rounded' : 'rounded-full'

  return `${size} ${variantMap[variant][color]} ${shape} inline-flex items-center gap-1 ${props.class || ''}`
})
</script>

<template>
  <component :is="tag" :class="baseClasses">
    <!-- Leading icon/avatar/slot -->
    <slot name="leading">
      <ion-icon
        v-if="props.leadingIcon"
        :name="props.leadingIcon"
        class="w-4 h-4"
      />
      <img
        v-else-if="avatar?.src"
        :src="avatar.src"
        :alt="avatar.alt || 'avatar'"
        class="w-5 h-5 rounded-full object-cover"
      />
    </slot>

    <!-- Label or default slot -->
    <slot>
      <span v-if="label !== undefined && label !== null">
        {{ label }}
      </span>
    </slot>

    <!-- Trailing icon/slot -->
    <slot name="trailing">
      <ion-icon
        v-if="props.trailingIcon"
        :name="props.trailingIcon"
        class="w-4 h-4"
      />
    </slot>
  </component>
</template>
