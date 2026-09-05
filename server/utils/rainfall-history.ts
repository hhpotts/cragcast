/**
 * Recent (past) rainfall lookup — Open-Meteo Historical Weather API.
 *
 * Forecasts only tell us about the requested dates going forward; they say
 * nothing about whether the rock has actually had time to dry out from
 * rain *before* that window. This fills that gap with real daily rainfall
 * totals for the days immediately preceding today.
 *
 * Efficiency: one API call per unique coordinate covers the full 7-day
 * lookback (the archive API takes a date range, not per-day requests), and
 * every rock type just slices the days it cares about out of that same
 * array — no rock type ever triggers its own fetch. Once a day is fully in
 * the past its rainfall total is an immutable historical fact, so results
 * are cached indefinitely (well past the 7-day window we'd ever query).
 */

import { kvFromEvent } from './forecast'
import { sleep } from './server-utils'

const MAX_LOOKBACK_DAYS = 7

// How many of the most recent days each rock type's dry-out rule cares
// about, per the climbing-science knowledge already used elsewhere in this
// app (see docs/RESEARCH.md Part 2 and server/utils/ai/knowledge.ts).
// Capped at MAX_LOOKBACK_DAYS; 0 means "not meaningfully rain-total driven".
const ROCK_LOOKBACK_DAYS: Record<string, number> = {
  gritstone: 2,   // 48h dry rule
  sandstone: 4,   // BMC: "multiple days of dry weather in a row"
  limestone: 3,   // surface dries fast, but seepage continues for days
  rhyolite: 7,    // 3-7 day dry spell needed for vegetated mountain catchments
  granite: 1,     // dries quickly; mostly a condensation issue, not rain-total driven
  slate: 0,       // dries within an hour — a daily lookback tells us nothing useful
  andesite: 2,
  other: 2
}

/** Days of rainfall history relevant to a given set of rock types (the max across them). */
export function lookbackDaysForRocks(rocks: string[]): number {
  if (!rocks.length) return 2
  const days = rocks.map(r => ROCK_LOOKBACK_DAYS[r] ?? 2)
  return Math.min(MAX_LOOKBACK_DAYS, Math.max(...days))
}

export type RainfallHistory = {
  /** Daily totals in mm, oldest first, ending yesterday (today is left to the forecast). */
  dailyMm: number[]
  /** ISO dates matching dailyMm, oldest first. */
  dates: string[]
}

function cacheKey(lat: number, lon: number, endDate: string) {
  const ll = `${lat.toFixed(2)},${lon.toFixed(2)}`
  return `rainhist:${ll}:${endDate}`
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

async function fetchFromApi(lat: number, lon: number, startDate: string, endDate: string): Promise<RainfallHistory> {
  const url = new URL('https://archive-api.open-meteo.com/v1/archive')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)
  url.searchParams.set('daily', 'precipitation_sum')
  url.searchParams.set('timezone', 'Europe/London')

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'User-Agent': 'CragCast/0.1 (+https://cragcast.app)' }
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Open-Meteo archive fetch failed (${res.status}): ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  return {
    dailyMm: (data?.daily?.precipitation_sum || []).map((v: number | null) => v ?? 0),
    dates: data?.daily?.time || []
  }
}

/**
 * Get the last MAX_LOOKBACK_DAYS days of rainfall ending yesterday, for one
 * coordinate. Always fetches (or reads from cache) the full 7-day window
 * regardless of which rock types will use it — callers slice what they need
 * via lookbackDaysForRocks() so a single fetch serves every rock type.
 */
export async function getRecentRainfall(event: any, lat: number, lon: number): Promise<RainfallHistory | null> {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const start = new Date(yesterday)
  start.setDate(start.getDate() - (MAX_LOOKBACK_DAYS - 1))

  const endDate = isoDate(yesterday)
  const startDate = isoDate(start)
  const key = cacheKey(lat, lon, endDate)
  const kv = kvFromEvent(event)

  if (kv) {
    const raw = await kv.get(key).catch(() => null)
    if (raw) {
      try { return JSON.parse(raw) } catch { /* fall through to a live fetch */ }
    }
  }

  // Retry with backoff on transient failures (e.g. Open-Meteo rate-limiting
  // during a burst of cache misses across many regions at once) — worth a
  // couple of retries since a successful result is cached essentially
  // forever, so this cost is paid at most once per coordinate per day.
  let lastErr: any
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const history = await fetchFromApi(lat, lon, startDate, endDate)
      if (kv) {
        // Past days never change once fetched — cache well beyond the 7-day
        // window we'd ever query, purely to bound KV storage growth.
        await kv.put(key, JSON.stringify(history), { expirationTtl: 60 * 60 * 24 * 14 }).catch(() => {})
      }
      return history
    } catch (e) {
      lastErr = e
      if (attempt < 2) await sleep(300 * Math.pow(2, attempt))
    }
  }

  console.warn('[rainfall-history] fetch failed after retries', { lat, lon, err: String(lastErr) })
  return null
}

/** Sum the most recent `days` entries (the array ends yesterday, so this is a trailing window). */
export function sumRecentDays(history: RainfallHistory | null, days: number): number {
  if (!history || days <= 0) return 0
  const slice = history.dailyMm.slice(Math.max(0, history.dailyMm.length - days))
  return Math.round(slice.reduce((s, x) => s + x, 0) * 10) / 10
}
