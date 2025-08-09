"use client"

import { useEffect, useRef } from 'react'
import { useMenu } from './use-menu'

interface MenuUpdateEvent {
  type: 'product' | 'category'
  action: 'created' | 'updated' | 'deleted'
  data: any
  timestamp: string
}

interface MenuRefreshEvent {
  timestamp: string
}

export function useMenuRealtime() {
  const { fetchMenu } = useMenu()
  const socketRef = useRef<any>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connectSocket = () => {
    try {
      // Initialize socket connection
      socketRef.current = new (window as any).io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')

      socketRef.current.on('connect', () => {
        console.log('Connected to menu real-time updates')
        reconnectAttempts.current = 0
        // Join menu updates room
        socketRef.current.emit('join-menu')
      })

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from menu real-time updates')
        attemptReconnect()
      })

      socketRef.current.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error)
        attemptReconnect()
      })

      // Listen for menu updates
      socketRef.current.on('menu-update', (event: MenuUpdateEvent) => {
        console.log('Menu update received:', event)
        // Refresh menu data
        fetchMenu({ forceRefresh: true })
      })

      // Listen for menu refresh requests
      socketRef.current.on('menu-refresh', (event: MenuRefreshEvent) => {
        console.log('Menu refresh requested:', event)
        // Refresh menu data
        fetchMenu({ forceRefresh: true })
      })

    } catch (error) {
      console.error('Error initializing socket:', error)
      attemptReconnect()
    }
  }

  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    reconnectAttempts.current++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff

    console.log(`Attempting to reconnect in ${delay}ms...`)

    reconnectTimeoutRef.current = setTimeout(() => {
      connectSocket()
    }, delay)
  }

  useEffect(() => {
    // Load socket.io client dynamically
    const loadSocketClient = async () => {
      try {
        // Dynamically import socket.io client
        await import('socket.io-client')
        connectSocket()
      } catch (error) {
        console.error('Error loading socket.io client:', error)
      }
    }

    loadSocketClient()

    return () => {
      // Cleanup
      if (socketRef.current) {
        socketRef.current.emit('leave-menu')
        socketRef.current.disconnect()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    isConnected: socketRef.current?.connected || false,
    socket: socketRef.current
  }
}