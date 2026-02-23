<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue"

interface Props {
    texts: string[]
}

const props = defineProps<Props>()

const text1 = ref<HTMLElement | null>(null)
const text2 = ref<HTMLElement | null>(null)

const morphTime = 1.5
const cooldownTime = 1.2

let textIndex = 0
let morph = 0
let cooldown = cooldownTime
let lastTime = new Date()
let animationFrame: number

function easeInOut(t: number) {
    return t * t * (3 - 2 * t) // smoothstep easing
}

function setStyles(fraction: number) {
    if (!text1.value || !text2.value || !props.texts?.length) return

    const safe = Math.max(0.001, Math.min(1, fraction))
    const eased = easeInOut(safe)

    const blurAmount = 8 // ↓ reduced from 8 (sharper)

    // Incoming text
    text2.value.style.filter = `blur(${blurAmount * (1 - eased)}px)`
    text2.value.style.opacity = `${eased * 100}%`

    // Outgoing text
    text1.value.style.filter = `blur(${blurAmount * eased}px)`
    text1.value.style.opacity = `${(1 - eased) * 100}%`

    text1.value.textContent =
        props.texts[textIndex % props.texts.length]

    text2.value.textContent =
        props.texts[(textIndex + 1) % props.texts.length]
}

function doMorph() {
    morph -= cooldown
    cooldown = 0

    let fraction = morph / morphTime

    if (fraction > 1) {
        cooldown = cooldownTime
        fraction = 1
    }

    setStyles(fraction)

    if (fraction === 1) {
        textIndex++
    }
}

function doCooldown() {
    morph = 0
    if (!text1.value || !text2.value) return

    text2.value.style.filter = "none"
    text2.value.style.opacity = "100%"
    text1.value.style.filter = "none"
    text1.value.style.opacity = "0%"
}

function animate() {
    animationFrame = requestAnimationFrame(animate)

    const newTime = new Date()
    const dt = (newTime.getTime() - lastTime.getTime()) / 1000
    lastTime = newTime

    cooldown -= dt

    if (cooldown <= 0) {
        doMorph()
    } else {
        doCooldown()
    }
}

onMounted(() => {
    animate()
})

onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrame)
})
</script>

<template>
    <div class="relative w-full text-center font-bold leading-tight
         min-h-[1.2em]
         [filter:url(#threshold)_blur(0.6px)]">
        <span ref="text1" class="absolute inset-0 flex items-center justify-center w-full" />

        <span ref="text2" class="absolute inset-0 flex items-center justify-center w-full" />

        <!-- SVG Filter -->
        <svg class="hidden">
            <defs>
                <filter id="threshold">
                    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140" />
                </filter>
            </defs>
        </svg>
    </div>
</template>