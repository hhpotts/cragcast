import { ref, type Ref } from 'vue'

export type CragItem = {
  id: string
  name: string
  regionId: string
  score: number
  modifiers: string[]
  why: string[]
  warnings?: { level: string; type: string; message: string }[]
  daily: { date: string; icon: string; tempAvgC: number; windAvgMph: number; rainSumMm: number }[]
  avgTempC: number
  avgWindMph: number
  totalRainMm: number
  aspect: string | null
  rock: string[]
  types: { trad?: number; sport?: number; boulder?: number }
  routeCount: number
  tags: string[]
  coords: { lat: number; lon: number }
  distanceMins: number
  ukcUrl: string
  links?: { windy: string; yrno: string }
}

// Per-region cache of crag data, shared across every useCrags() call site
const cache = new Map<string, { items: CragItem[]; t: number }>()
// In-flight requests keyed the same way as the cache, so concurrent calls for
// the same region+filters (e.g. a double-click, or two components expanding
// the same region) share one request instead of racing and resolving out of order.
const inFlight = new Map<string, Promise<CragItem[]>>()
const TTL_MS = 5 * 60 * 1000

function buildCacheKey(regionId: string, opts: { lat?: number; lon?: number; dates: string; minDriveMins?: number; maxDriveMins?: number }) {
  const minKey = opts.minDriveMins ? String(opts.minDriveMins) : '0'
  const maxKey = opts.maxDriveMins !== undefined && Number.isFinite(opts.maxDriveMins) ? String(opts.maxDriveMins) : 'inf'
  // minDriveMins/maxDriveMins affect the score returned per crag, so they must be
  // part of the key — otherwise changing the distance filter can silently serve
  // scores computed under the previous filter for up to TTL_MS.
  return `crags:${regionId}:${opts.dates}:${opts.lat ?? 'na'}:${opts.lon ?? 'na'}:${minKey}-${maxKey}`
}

export function useCrags() {
  const pending = ref(false)

  async function fetchCrags(
    regionId: string,
    opts: { lat?: number; lon?: number; dates: string; minDriveMins?: number; maxDriveMins?: number }
  ): Promise<CragItem[]> {
    const cacheKey = buildCacheKey(regionId, opts)
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.t < TTL_MS) {
      return cached.items
    }

    pending.value = true
    try {
      let promise = inFlight.get(cacheKey)
      if (!promise) {
        promise = (async () => {
          try {
            const params: any = { regionId, dates: opts.dates }
            if (opts.lat !== undefined) params.lat = opts.lat
            if (opts.lon !== undefined) params.lon = opts.lon
            if (opts.minDriveMins) params.minDriveMins = opts.minDriveMins
            if (opts.maxDriveMins !== undefined && Number.isFinite(opts.maxDriveMins)) params.maxDriveMins = opts.maxDriveMins

            const items = await $fetch<CragItem[]>('/api/crags', { params })
            cache.set(cacheKey, { items, t: Date.now() })
            return items
          } catch (e) {
            console.warn('[useCrags] fetch failed', { regionId, err: String(e) })
            return []
          } finally {
            inFlight.delete(cacheKey)
          }
        })()
        inFlight.set(cacheKey, promise)
      }
      return await promise
    } finally {
      pending.value = false
    }
  }

  return { fetchCrags, pending }
}
