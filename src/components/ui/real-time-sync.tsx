"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'

interface SyncStatus {
  isConnected: boolean
  lastSync: Date | null
  isSyncing: boolean
  syncError: string | null
  pendingChanges: number
}

interface RealTimeSyncProps {
  onRefresh?: () => void
  onSyncComplete?: () => void
  lastSyncTime?: Date | null
}

export default function RealTimeSync({ onRefresh, onSyncComplete, lastSyncTime }: RealTimeSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: true,
    lastSync: null,
    isSyncing: false,
    syncError: null,
    pendingChanges: 0
  })

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/health')
      setSyncStatus(prev => ({
        ...prev,
        isConnected: response.ok,
        syncError: response.ok ? null : 'Servidor indisponível'
      }))
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isConnected: false,
        syncError: 'Erro de conexão'
      }))
    }
  }

  const handleRefresh = async () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }))
    
    try {
      if (onRefresh) {
        await onRefresh()
      }
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingChanges: 0
      }))
      
      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Erro ao sincronizar'
      }))
    }
  }

  // Update last sync time when prop changes
  useEffect(() => {
    if (lastSyncTime) {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: lastSyncTime,
        syncError: null
      }))
    }
  }, [lastSyncTime])

  // Check connection status periodically
  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Simulate pending changes (in a real app, this would come from a queue or state management)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance of having pending changes
        setSyncStatus(prev => ({
          ...prev,
          pendingChanges: Math.floor(Math.random() * 5) + 1
        }))
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Nunca'
    
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Agora mesmo'
    if (seconds < 3600) return `Há ${Math.floor(seconds / 60)} minutos`
    if (seconds < 86400) return `Há ${Math.floor(seconds / 3600)} horas`
    return `Há ${Math.floor(seconds / 86400)} dias`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5" />
          <span>Sincronização</span>
        </CardTitle>
        <CardDescription>
          Status da sincronização do cardápio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {syncStatus.isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">Conexão</span>
          </div>
          <Badge variant={syncStatus.isConnected ? "default" : "destructive"}>
            {syncStatus.isConnected ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {syncStatus.isSyncing ? (
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            ) : syncStatus.syncError ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm">Status</span>
          </div>
          <Badge variant={
            syncStatus.isSyncing ? "secondary" : 
            syncStatus.syncError ? "destructive" : "default"
          }>
            {syncStatus.isSyncing ? "Sincronizando..." : 
             syncStatus.syncError ? "Erro" : "Sincronizado"}
          </Badge>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Última sincronização</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatTimeAgo(syncStatus.lastSync)}
          </span>
        </div>

        {/* Pending Changes */}
        {syncStatus.pendingChanges > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Alterações pendentes</span>
            </div>
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              {syncStatus.pendingChanges}
            </Badge>
          </div>
        )}

        {/* Error Message */}
        {syncStatus.syncError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{syncStatus.syncError}</p>
          </div>
        )}

        {/* Refresh Button */}
        <Button 
          onClick={handleRefresh} 
          disabled={syncStatus.isSyncing || !syncStatus.isConnected}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          {syncStatus.isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>

        {/* Auto-sync Info */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Sincronização automática a cada 5 minutos</p>
          <p>Verificação de conexão a cada 30 segundos</p>
        </div>
      </CardContent>
    </Card>
  )
}