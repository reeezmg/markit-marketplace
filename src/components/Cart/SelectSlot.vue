<template>
  <IonModal
    :is-open="isOpen"
    @didDismiss="onClose"
    breakpoints="[0, 1]"
    initialBreakpoint="1"
    :handle-behavior="'cycle'"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
  >
    <div class="select-slot-shell p-4">
      <div class="select-slot-title mb-1">When do you want your trial bag?</div>
      <div class="select-slot-subtitle mb-4">30 mins trial time</div>

      <!-- top two dates -->
      <div class="flex items-start gap-6 mb-4">
        <button
          v-for="(d, i) in topDates"
          :key="d.toDateString()"
          @click="selectDateIndex(i)"
          :class="[
            'select-slot-date flex flex-col items-center',
            selectedDateIndex === i ? 'select-slot-date--active' : 'select-slot-date--inactive'
          ]"
        >
          <div :class="selectedDateIndex === i ? 'select-slot-date-text is-active' : 'select-slot-date-text'">
            {{ shortWeekday(d) }}
          </div>
          <div class="select-slot-date-meta">{{ dayMonth(d) }}</div>
        </button>
      </div>

      <!-- Sections (Morning/Afternoon/Evening) -->
      <div class="space-y-6">
        <div
          v-for="section in sectionsList"
          :key="section.label"
        >
          <div class="select-slot-section-title mb-2">{{ section.label }}</div>

          <div class="overflow-x-auto scrollbar-hide">
            <div class="flex gap-2 pb-2">
              <div v-if="section.slots.length === 0" class="select-slot-empty px-3 py-2">No slots</div>

              <button
                v-for="slot in section.slots"
                :key="slot.toISOString()"
                @click="onSelectSlot(slot)"
                class="select-slot-chip min-w-[102px] !p-2.5 !border whitespace-nowrap text-sm"
                :class="isSlotSelected(slot)
                  ? 'select-slot-chip--active'
                  : 'select-slot-chip--inactive'"
              >
                {{ formatTime(slot) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- bottom controls -->
      <div class="mt-6">
        <IonButton
          :disabled="!canProceed"
          expand="block"
          class="select-slot-proceed rounded-lg"
          @click="onProceed"
          :style="!canProceed ? { '--background': 'var(--markit-surface-muted)', '--color': 'var(--markit-text-muted)', opacity: '1' } : {}"
        >
          Proceed
        </IonButton>
      </div>
    </div>
  </IonModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { IonModal, IonButton } from "@ionic/vue";

/* props / emits */
defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(["close", "confirm"]);

/* ----- Settings ----- */
const SLOT_INTERVAL_MIN = 30; // minutes
const MORNING_START = { hour: 9, minute: 30 };
const AFTERNOON_START = { hour: 12, minute: 0 };
const EVENING_START = { hour: 16, minute: 0 };
const DAY_END = { hour: 20, minute: 0 };

/* ----- Reactive state ----- */
const selectedDateIndex = ref(0); // 0 or 1
const selectedSlot = ref<Date | null>(null);

/* ----- Helper time functions ----- */
function makeDateWithHM(baseDate: Date, h: number, m: number) {
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}
function addMinutes(d: Date, minutes: number) {
  return new Date(d.getTime() + minutes * 60000);
}
function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function shortWeekday(d: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (target.getTime() === today.getTime()) return "Tod";
  if (target.getTime() === tomorrow.getTime()) return "Tom";

  // fallback: normal weekday abbreviation
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d);
}

function dayMonth(d: Date) {
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function roundUpToInterval(d: Date, intervalMin: number) {
  const minutes = d.getMinutes();
  const remainder = minutes % intervalMin;
  if (remainder === 0) return new Date(d);
  const toAdd = intervalMin - remainder;
  return addMinutes(d, toAdd);
}
function generateSlotsForRange(baseDate: Date, startH: number, startM: number, endH: number, endM: number) {
  const start = makeDateWithHM(baseDate, startH, startM);
  const end = makeDateWithHM(baseDate, endH, endM);
  const slots: Date[] = [];
  let cur = new Date(start);
  while (cur.getTime() <= end.getTime()) {
    slots.push(new Date(cur));
    cur = addMinutes(cur, SLOT_INTERVAL_MIN);
  }
  return slots;
}

/* ----- Top dates logic ----- */
const topDates = computed(() => {
  const now = new Date();
  const cutoff = makeDateWithHM(now, 20, 0); // 8:00 PM
  let first = new Date(now);
  if (now.getTime() >= cutoff.getTime()) {
    first.setDate(first.getDate() + 1);
  }
  first.setHours(0, 0, 0, 0);
  const second = new Date(first);
  second.setDate(first.getDate() + 1);
  return [first, second];
});

/* ----- Slots generation for chosen date ----- */
function slotsForDate(date: Date) {
  const morning = generateSlotsForRange(date, MORNING_START.hour, MORNING_START.minute, 11, 59);
  const afternoon = generateSlotsForRange(date, AFTERNOON_START.hour, AFTERNOON_START.minute, 15, 59);
  const evening = generateSlotsForRange(date, EVENING_START.hour, EVENING_START.minute, DAY_END.hour, DAY_END.minute);
  return { morning, afternoon, evening };
}

/* ----- Visible slots rules (hide past slots if chosen date is today) ----- */
const visibleSections = computed(() => {
  const chosenDate = topDates.value[selectedDateIndex.value];
  const now = new Date();
  const isToday = isSameDay(chosenDate, now);

  let earliestAllowed: Date | null = null;
  if (isToday) {
    earliestAllowed = roundUpToInterval(now, SLOT_INTERVAL_MIN);
  }

  const sections = slotsForDate(chosenDate);
  function filterByEarliest(arr: Date[]) {
    if (!earliestAllowed) return arr;
    return arr.filter(s => s.getTime() >= earliestAllowed!.getTime());
  }

  return {
    morning: filterByEarliest(sections.morning),
    afternoon: filterByEarliest(sections.afternoon),
    evening: filterByEarliest(sections.evening),
  };
});

/* ----- Option B: sectionsList computed to iterate in template ----- */
const sectionsList = computed(() => [
  { label: "Morning", slots: visibleSections.value.morning },
  { label: "Afternoon", slots: visibleSections.value.afternoon },
  { label: "Evening", slots: visibleSections.value.evening },
]);

/* ----- UI handlers ----- */
function selectDateIndex(i: number) {
  selectedDateIndex.value = i;
  selectedSlot.value = null;
}
function onSelectSlot(slot: Date) {
  console.log("Selected slot:", slot);
  selectedSlot.value = slot;
}
function isSlotSelected(slot: Date) {
  return selectedSlot.value === slot;
}
const canProceed = computed(() => selectedSlot.value !== null);

function onClose() {
  emit("close");
}
function onProceed() {
  if (!canProceed.value) return;
  emit("confirm", selectedSlot.value);
  onClose();
}
</script>

<style scoped>
/* Override Ionic's disabled opacity so we can style disabled as a quiet Markit surface */
ion-button[disabled] {
  opacity: 1 !important;
}

ion-button[fill="outline"] {
  --border-radius: 12px;
  --border-width: 2px;
}

.min-w-\[110px\] {
  min-width: 110px;
}

ion-modal {
  --height: auto;
  --backdrop-opacity: 0.2;
}

ion-modal::part(content) {
  background: transparent;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;  /* IE/Edge */
  scrollbar-width: none;     /* Firefox */
}

.select-slot-shell {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 249, 0.96) 100%);
  color: var(--markit-text);
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid var(--markit-glass-border);
  border-bottom: 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 -10px 32px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  padding-bottom: calc(var(--markit-bottom-inset) + 18px) !important;
}

.select-slot-title {
  font-size: 1rem;
  line-height: 1.3;
  font-weight: 700;
  color: var(--markit-text);
}

.select-slot-subtitle,
.select-slot-date-meta,
.select-slot-empty {
  font-size: 0.84rem;
  line-height: 1.35;
  color: var(--markit-text-muted);
}

.select-slot-date {
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,249,0.94) 100%);
  border: 1px solid var(--markit-border);
  border-radius: 18px;
  min-width: 86px;
  min-height: 50px;
  padding: 7px 12px 6px;
  gap: 1px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.8),
    0 1px 2px rgba(15, 23, 42, 0.05);
}

.select-slot-date--active {
  border-color: var(--ion-color-primary);
  background: linear-gradient(180deg, color-mix(in srgb, var(--ion-color-primary) 8%, #ffffff) 0%, #ffffff 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.8),
    0 6px 18px rgba(83, 129, 108, 0.10);
}

.select-slot-date--inactive {
  border-color: var(--markit-border);
}

.select-slot-date-text {
  color: var(--markit-text-muted);
  font-size: 0.84rem;
  line-height: 1.1;
  font-weight: 600;
}

.select-slot-date-meta {
  line-height: 1.15;
}

.select-slot-date-text.is-active {
  color: var(--markit-text);
  font-weight: 700;
}

.select-slot-section-title {
  color: var(--markit-text);
  font-size: 0.92rem;
  font-weight: 600;
}

.select-slot-chip {
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,249,0.94) 100%);
  color: var(--markit-text);
  border-color: var(--markit-border);
  border-radius: 18px;
  min-height: 42px;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.select-slot-chip--active {
  background: linear-gradient(180deg, color-mix(in srgb, var(--ion-color-primary) 12%, #ffffff) 0%, #ffffff 100%);
  color: var(--markit-text);
  border-color: var(--ion-color-primary);
  box-shadow: 0 4px 12px rgba(83, 129, 108, 0.12);
}

.select-slot-chip--inactive {
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,249,0.96) 100%);
  color: var(--markit-text);
  border-color: var(--markit-border-strong);
}

.select-slot-proceed {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --background-focused: var(--ion-color-primary);
  --color: #ffffff;
  --border-radius: var(--markit-btn-radius);
  width: 100%;
  max-width: none;
  --box-shadow: none;
  min-height: 50px;
  font-weight: 700;
}

.select-slot-proceed::part(native) {
  background: var(--ion-color-primary);
  border: 1px solid var(--ion-color-primary);
  width: 100%;
  color: #ffffff;
}

</style>
