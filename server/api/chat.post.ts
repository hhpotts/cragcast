/**
 * POST /api/chat
 *
 * Conversational AI endpoint. Accepts messages, runs the orchestrator
 * with tool calling, and returns Server-Sent Events.
 *
 * Body: {
 *   messages: Array<{ role: 'user' | 'assistant', content: string }>,
 *   context?: { lat?, lon?, name?, dates?: string[], minDriveMins?, maxDriveMins? }
 * }
 * Response: text/event-stream with events: token, tool_call, done, error
 */

import { runOrchestrator, friendlyToolName } from '~/server/utils/ai/orchestrator'
import type { ChatMessage, UserContext } from '~/server/utils/ai/types'

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 1000
const MAX_DATES = 10

/** Sanitize the client-supplied prefs snapshot before it reaches the prompt. */
function parseUserContext(raw: any): UserContext | undefined {
  if (!raw || typeof raw !== 'object') return undefined

  const context: UserContext = {}
  const lat = Number(raw.lat)
  const lon = Number(raw.lon)
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
    context.lat = lat
    context.lon = lon
  }
  if (typeof raw.name === 'string' && raw.name.trim()) {
    context.name = raw.name.trim().slice(0, 100)
  }
  if (Array.isArray(raw.dates)) {
    const dates = raw.dates
      .filter((d: any) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
      .slice(0, MAX_DATES)
    if (dates.length) context.dates = dates
  }
  const minDriveMins = Number(raw.minDriveMins)
  if (Number.isFinite(minDriveMins) && minDriveMins > 0) context.minDriveMins = minDriveMins
  const maxDriveMins = Number(raw.maxDriveMins)
  if (Number.isFinite(maxDriveMins)) context.maxDriveMins = maxDriveMins

  return Object.keys(context).length ? context : undefined
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate input
  const messages: ChatMessage[] = body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'messages array required' })
  }

  const userContext = parseUserContext(body?.context)

  // Enforce limits
  const trimmed = messages.slice(-MAX_MESSAGES).map(m => ({
    role: m.role as ChatMessage['role'],
    content: typeof m.content === 'string' ? m.content.slice(0, MAX_MESSAGE_LENGTH) : ''
  }))

  // Check last message is from user
  const last = trimmed[trimmed.length - 1]
  if (last.role !== 'user') {
    throw createError({ statusCode: 400, statusMessage: 'Last message must be from user' })
  }

  // Get AI binding
  const env = event.context?.cloudflare?.env || {}
  const ai = env.AI
  if (!ai) {
    throw createError({ statusCode: 503, statusMessage: 'AI service not available' })
  }

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  // Use a TransformStream for SSE
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  function sendEvent(eventType: string, data: string) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
    writer.write(encoder.encode(payload)).catch(() => {})
  }

  // Run orchestrator in background, streaming events as they happen
  runOrchestrator(ai, event, trimmed, userContext, {
    onToken: (token) => sendEvent('token', token),
    onToolCall: (name) => sendEvent('tool_call', friendlyToolName(name)),
    onDone: () => {
      sendEvent('done', '')
      writer.close().catch(() => {})
    },
    onError: (error) => {
      sendEvent('error', error)
      writer.close().catch(() => {})
    }
  }).catch((e) => {
    sendEvent('error', `Unexpected error: ${e.message || String(e)}`)
    writer.close().catch(() => {})
  })

  return readable
})
