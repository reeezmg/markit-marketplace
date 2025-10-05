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
    <div class="p-4 pb-8 mb-2">
      <div class="text-lg font-semibold mb-1">When do you want your trial bag?</div>
      <div class="text-sm text-gray-500 mb-4">30 mins trial time</div>

      <!-- top two dates -->
      <div class="flex items-start gap-6 mb-4">
        <button
          v-for="(d, i) in topDates"
          :key="d.toDateString()"
          @click="selectDateIndex(i)"
          :class="[
            'flex flex-col items-center px-4 py-3 rounded-lg border min-w-[86px] bg-white',
            selectedDateIndex === i ? 'border-green-900' : 'border-gray-200'
          ]"
        >
          <div :class="selectedDateIndex === i ? 'text-green-900 font-semibold' : 'text-gray-700 font-medium'">
            {{ shortWeekday(d) }}
          </div>
          <div class="text-sm text-gray-500 mt-1">{{ dayMonth(d) }}</div>
          <div
            v-if="selectedDateIndex === i"
            class="w-full mt-2 border-t-2 border-green-900 rounded-b-md"
            style="transform: translateY(-6px);"
          ></div>
        </button>
      </div>

      <!-- Sections (Morning/Afternoon/Evening) -->
      <div class="space-y-6">
        <div
          v-for="section in sectionsList"
          :key="section.label"
        >
          <div class="mb-2 font-medium text-gray-800">{{ section.label }}</div>

          <div class="overflow-x-auto scrollbar-hide">
            <div class="flex gap-2 pb-2">
              <div v-if="section.slots.length === 0" class="text-sm text-gray-400 px-3 py-2">No slots</div>

              <button
                v-for="slot in section.slots"
                :key="slot.toISOString()"
                @click="onSelectSlot(slot)"
                class="min-w-[110px] !p-3 !rounded-xl !border whitespace-nowrap text-base"
                :class="isSlotSelected(slot)
                  ? 'bg-green-900 text-white !border-green-900'
                  : 'bg-white text-gray-800 !border-gray-500'"
              >
                {{ formatTime(slot) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- bottom controls -->
      <div class="flex items-center gap-4 mt-6">
        <IonButton fill="outline" expand="block" class="rounded-lg flex-1" @click="onBack">Back</IonButton>

        <IonButton
          :disabled="!canProceed"
          expand="block"
          class="rounded-lg flex-1"
          @click="onProceed"
          :style="!canProceed ? { '--background': '#e5e7eb', '--color': '#9ca3af', opacity: '1' } : {}"
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
const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(["close", "back", "confirm"]);

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
function onBack() {
  emit("back");
}
function onProceed() {
  if (!canProceed.value) return;
  emit("confirm", selectedSlot.value);
  onClose();
}
</script>

<style scoped>
/* Override Ionic's disabled opacity so we can style disabled as flat grey */
ion-button[disabled] {
  opacity: 1 !important;
}

/* Optional: make the outline Back button look like your screenshot */
ion-button[fill="outline"] {
  --border-radius: 12px;
  --border-width: 2px;
}

/* small spacing tweaks (optional) */
.min-w-\[110px\] {
  min-width: 110px;
}

ion-modal {
  --height: auto;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;  /* IE/Edge */
  scrollbar-width: none;     /* Firefox */
}
</style>
