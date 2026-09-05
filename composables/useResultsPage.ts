import { ref, computed, onMounted, watch } from 'vue'
import { usePrefs, type PrefsSnapshot } from './usePrefs'

/**
 * Shared "prefs-driven results page" shell used by both /table and /cards.
 * Owns showPrefs, the hasUrlDates/route-query watching, and the debounce —
 * the two pages differ only in what they fetch and how they render it.
 *
 * The route-query watch fires on every query change (e.g. each step of a
 * multi-step browser back/forward), but only the *first* change in a burst
 * clears the currently-displayed results — later changes within the same
 * 150ms window just reset the debounce timer. This still clears eagerly
 * (avoiding a flash of stale/out-of-range content) without re-clearing
 * (and re-flickering) on every intermediate change before the debounce fires.
 */
export function useResultsPage(handlers: {
  /** Fetch + populate results for the given prefs snapshot. */
  onLoad: (snap: PrefsSnapshot) => void | Promise<void>
  /** Reset all displayed result state (also called when dates disappear from the URL). */
  onClearResults: () => void
  /** Whether this page already has results, to avoid re-fetching on first mount. */
  hasExistingData: () => boolean
  /** Where "Clear" navigates to. */
  clearHref: string
}) {
  const prefs = usePrefs()
  const route = useRoute()
  const showPrefs = ref(true)
  const hasUrlDates = computed(() => typeof route.query.dates === 'string' && (route.query.dates as string).length > 0)
  let routeWatchTimer: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    showPrefs.value = !hasUrlDates.value
    if (hasUrlDates.value && !handlers.hasExistingData()) {
      handlers.onLoad(prefs.snapshot())
    }
  })

  // Handles browser back/forward, direct URL edits, and post-commit URL updates.
  watch(() => route.query, () => {
    const isLeadingEdge = !routeWatchTimer
    if (routeWatchTimer) clearTimeout(routeWatchTimer)
    if (isLeadingEdge && !showPrefs.value && hasUrlDates.value) {
      handlers.onClearResults()
    }
    routeWatchTimer = setTimeout(() => {
      routeWatchTimer = null
      const has = hasUrlDates.value
      showPrefs.value = !has
      if (has) {
        handlers.onLoad(prefs.snapshot())
      } else {
        handlers.onClearResults()
      }
    }, 150)
  }, { deep: true })

  async function applyPrefs() {
    showPrefs.value = false
    handlers.onClearResults()
    await prefs.commit()
    // Route watcher fires after commit and handles the fetch
  }

  function clear() {
    if (process.client) window.location.replace(handlers.clearHref)
  }

  return { prefs, route, showPrefs, hasUrlDates, applyPrefs, clear }
}
