/** Types for the conversational AI orchestrator. */

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
}

/**
 * The user's saved location/date/distance prefs from usePrefs, passed
 * alongside chat messages so the model doesn't have to guess coordinates
 * for vague queries like "where should I climb near me this weekend".
 */
export type UserContext = {
  lat?: number
  lon?: number
  name?: string
  dates?: string[]
  minDriveMins?: number
  maxDriveMins?: number
}

/** Workers AI tool call shape: { name, arguments } */
export type ToolCall = {
  name: string
  arguments: Record<string, any> | string
}

/** Workers AI tool definition: { name, description, parameters } */
export type ToolDefinition = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type SSEEvent =
  | { event: 'token'; data: string }
  | { event: 'tool_call'; data: string }
  | { event: 'done'; data: string }
  | { event: 'error'; data: string }
