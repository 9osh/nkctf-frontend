/**
 * WebSocket composable for STOMP over SockJS connections
 * Provides real-time messaging capabilities with automatic reconnection
 */

import SockJS from 'sockjs-client'
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'

interface SubscriptionInfo {
  subscription: StompSubscription
  topic: string
  callback: (data: unknown) => void
}

interface PendingSubscription {
  topic: string
  callback: (data: unknown) => void
}

export function useWebSocket() {
  const config = useRuntimeConfig()

  // Build WebSocket URL from API base
  const getWsUrl = () => {
    const apiBase = config.public.apiBase as string
    // Convert http(s)://host:port/api to http(s)://host:port/ws
    const baseUrl = apiBase.replace(/\/api$/, '')
    return `${baseUrl}/ws`
  }

  // Shared state across components
  const isConnected = useState<boolean>('ws-connected', () => false)
  const reconnectAttempts = useState<number>('ws-reconnect-attempts', () => 0)

  // Client instance (not reactive, managed internally)
  let client: Client | null = null
  const subscriptions = new Map<string, SubscriptionInfo>()
  const pendingSubscriptions: PendingSubscription[] = []

  const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]
  const MAX_RECONNECT_ATTEMPTS = 10

  /**
   * Initialize and connect to WebSocket server
   */
  function connect() {
    // Prevent multiple connections
    if (client?.connected || client?.active) {
      return
    }

    const wsUrl = getWsUrl()
    console.log('[WebSocket] Connecting to:', wsUrl)

    client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('[WebSocket] Connected')
        isConnected.value = true
        reconnectAttempts.value = 0

        // Re-subscribe pending subscriptions
        while (pendingSubscriptions.length > 0) {
          const pending = pendingSubscriptions.shift()!
          doSubscribe(pending.topic, pending.callback)
        }

        // Re-subscribe existing subscriptions after reconnect
        subscriptions.forEach((info) => {
          if (client?.connected) {
            const newSub = client.subscribe(info.topic, (message: IMessage) => {
              try {
                const data = JSON.parse(message.body)
                info.callback(data)
              } catch (e) {
                console.error('[WebSocket] Failed to parse message:', e)
              }
            })
            info.subscription = newSub
          }
        })
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected')
        isConnected.value = false
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers.message)
      },

      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event)
        reconnectAttempts.value++

        if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
          console.warn('[WebSocket] Max reconnect attempts reached')
        }
      }
    })

    client.activate()
  }

  /**
   * Disconnect from WebSocket server
   */
  function disconnect() {
    if (client) {
      client.deactivate()
      client = null
    }
    subscriptions.clear()
    pendingSubscriptions.length = 0
    isConnected.value = false
    reconnectAttempts.value = 0
  }

  /**
   * Internal subscription handler
   */
  function doSubscribe<T>(topic: string, callback: (data: T) => void): () => void {
    if (!client?.connected) {
      console.warn('[WebSocket] Not connected, queueing subscription:', topic)
      pendingSubscriptions.push({ topic, callback: callback as (data: unknown) => void })

      // Return unsubscribe function that removes from pending
      return () => {
        const index = pendingSubscriptions.findIndex(p => p.topic === topic && p.callback === callback)
        if (index !== -1) {
          pendingSubscriptions.splice(index, 1)
        }
      }
    }

    // Already subscribed to this topic
    if (subscriptions.has(topic)) {
      console.log('[WebSocket] Already subscribed to:', topic)
      return () => unsubscribe(topic)
    }

    const subscription = client.subscribe(topic, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body) as T
        callback(data)
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', e)
      }
    })

    subscriptions.set(topic, {
      subscription,
      topic,
      callback: callback as (data: unknown) => void
    })

    console.log('[WebSocket] Subscribed to:', topic)

    return () => unsubscribe(topic)
  }

  /**
   * Subscribe to a topic with typed callback
   */
  function subscribe<T>(topic: string, callback: (data: T) => void): () => void {
    return doSubscribe(topic, callback)
  }

  /**
   * Unsubscribe from a topic
   */
  function unsubscribe(topic: string) {
    const info = subscriptions.get(topic)
    if (info) {
      try {
        info.subscription.unsubscribe()
      } catch {
        // Ignore if already unsubscribed
      }
      subscriptions.delete(topic)
      console.log('[WebSocket] Unsubscribed from:', topic)
    }
  }

  /**
   * Get current reconnect delay based on attempts
   */
  function getReconnectDelay(): number {
    const index = Math.min(reconnectAttempts.value, RECONNECT_DELAYS.length - 1)
    return RECONNECT_DELAYS[index]
  }

  /**
   * Check if should use fallback polling
   */
  const shouldUseFallback = computed(() => {
    return !isConnected.value && reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS
  })

  return {
    isConnected: readonly(isConnected),
    reconnectAttempts: readonly(reconnectAttempts),
    shouldUseFallback,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    getReconnectDelay
  }
}
