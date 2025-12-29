import { ref } from 'vue'

export function useDebouncedSearch(fn: (v: string) => void, delay = 500) {
    let timer: number | undefined

    return (value: string) => {
        window.clearTimeout(timer)
        timer = window.setTimeout(() => {
            fn(value)
        }, delay)
    }
}
