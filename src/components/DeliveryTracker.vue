<template>
  <div class="dt-wrapper" v-if="packed || events.length > 0">
    <!-- Header -->
    <div class="dt-header">
      <span class="dt-label">Delivery Partner</span>
      <span class="dt-status" :class="statusClass">{{ activeStepLabel }}</span>
    </div>

    <!-- Progress bar -->
    <div class="dt-bar-track">
      <div class="dt-bar-fill" :style="{ width: progressPercent + '%' }" />
    </div>

    <!-- Dots row -->
    <div class="dt-dots">
      <template v-for="(s, i) in steps" :key="i">
        <div v-if="i > 0" class="dt-connector" :class="{ done: i <= currentStepIdx }" />
        <div class="dt-dot-col">
          <div class="dt-dot" :class="dotClass(i)">
            <template v-if="i < currentStepIdx">&#10003;</template>
            <template v-else>{{ i + 1 }}</template>
          </div>
          <span class="dt-dot-label" :class="{ active: i === currentStepIdx }">{{ s.label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StepEvent {
  step: string
  action: string
  meta?: any
  created_at?: string
}

interface StepDef {
  key: string
  storeIndex?: number
  label: string
}

const props = defineProps<{
  events: StepEvent[]
  storeCount?: number
  packed?: boolean
}>()

/**
 * Build the step list dynamically based on number of stores.
 * Single store:  Pickup → Collect → On the Way → Delivered → Waiting
 * Multi store:   Pickup 1 → Collect 1 → Pickup 2 → Collect 2 → On the Way → Delivered → Waiting
 */
const steps = computed<StepDef[]>(() => {
  const n = props.storeCount ?? 1
  const list: StepDef[] = []

  list.push({ key: 'Packed', label: 'Packed' })

  for (let i = 0; i < n; i++) {
    const sfx = n > 1 ? ` ${i + 1}` : ''
    list.push({ key: 'GoToPickup',   storeIndex: i, label: `Pickup${sfx}` })
    list.push({ key: 'CollectOrder', storeIndex: i, label: `Collect${sfx}` })
  }

  list.push({ key: 'GoToDrop',        label: 'On the Way' })
  list.push({ key: 'Delivered',       label: 'Delivered' })
  list.push({ key: 'TrynbuyWaiting', label: 'Waiting for You' })

  return list
})

/**
 * Determine the current step index from events.
 * For steps with storeIndex, match event meta.storeIndex.
 * A "complete" event means the step is done → current is next step.
 * An "enter" event means the step is active.
 */
const currentStepIdx = computed(() => {
  // Check if packed from prop OR from a "Packed complete" step event
  const packedFromEvents = props.events.some(e => e.step === 'Packed' && e.action === 'complete')
  const isPacked = props.packed || packedFromEvents

  let highest = isPacked ? 1 : 0

  // If not even packed yet, stay on step 0
  if (!isPacked) return 0

  for (const ev of props.events) {
    const evStoreIdx = ev.meta?.storeIndex ?? null

    for (let i = 0; i < steps.value.length; i++) {
      const s = steps.value[i]
      if (s.key !== ev.step) continue

      // For pickup/collect steps, match storeIndex
      if (s.storeIndex !== undefined && evStoreIdx !== null) {
        if (Number(evStoreIdx) !== s.storeIndex) continue
      }

      if (ev.action === 'complete' && i + 1 > highest) highest = i + 1
      else if (ev.action === 'enter' && i > highest) highest = i
    }
  }

  return Math.min(highest, steps.value.length - 1)
})

const activeStepLabel = computed(() =>
  currentStepIdx.value >= 0 ? steps.value[currentStepIdx.value].label : 'Pending'
)

const progressPercent = computed(() => {
  if (currentStepIdx.value < 0) return 0
  return (currentStepIdx.value / Math.max(steps.value.length - 1, 1)) * 100
})

const statusClass = computed(() => {
  const step = steps.value[currentStepIdx.value]
  if (!step) return ''
  if (step.key === 'Delivered' || step.key === 'TrynbuyWaiting') return 'delivered'
  return 'in-progress'
})

const dotClass = (i: number) => {
  if (i < currentStepIdx.value) return 'done'
  if (i === currentStepIdx.value) return 'active'
  return 'pending'
}
</script>

<style scoped>
.dt-wrapper {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.dt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dt-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.dt-status {
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
}
.dt-status.delivered { color: #16a34a; }
.dt-status.in-progress { color: #2563eb; }

/* Progress bar */
.dt-bar-track {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 14px;
}

.dt-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: #2563eb;
  transition: width 0.4s ease;
}

/* Dots row */
.dt-dots {
  display: flex;
  align-items: flex-start;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.dt-dots::-webkit-scrollbar { display: none; }

.dt-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.dt-connector {
  flex: 1;
  height: 2px;
  background: #d1d5db;
  align-self: center;
  margin-top: -18px;
  min-width: 8px;
}
.dt-connector.done { background: #2563eb; }

.dt-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.dt-dot.done {
  background: #2563eb;
  color: #fff;
}

.dt-dot.active {
  background: #2563eb;
  color: #fff;
  animation: dt-pulse 1.6s ease-in-out infinite;
}

.dt-dot.pending {
  background: #fff;
  color: #9ca3af;
  border: 2px solid #d1d5db;
}

.dt-dot-label {
  font-size: 9px;
  color: #9ca3af;
  margin-top: 4px;
  max-width: 60px;
  text-align: center;
  line-height: 1.2;
  word-wrap: break-word;
}
.dt-dot-label.active {
  color: #2563eb;
  font-weight: 600;
}

@keyframes dt-pulse {
  0%  { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.45); }
  70% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}
</style>
