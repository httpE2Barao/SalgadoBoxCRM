import { useState, useCallback } from 'react'

interface UseBulkSelectionProps<T> {
  items: T[]
  getId: (item: T) => string
}

export function useBulkSelection<T>({ items, getId }: UseBulkSelectionProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(getId)))
    }
  }, [items, getId, selectedIds.size])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  const getSelectedItems = useCallback(() => 
    items.filter(item => selectedIds.has(getId(item))), 
    [items, getId, selectedIds]
  )

  const selectionCount = selectedIds.size
  const isAllSelected = items.length > 0 && selectedIds.size === items.length

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedItems,
    selectionCount,
    isAllSelected
  }
}