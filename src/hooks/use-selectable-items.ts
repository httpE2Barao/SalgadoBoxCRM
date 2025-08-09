import { useState, useCallback } from 'react'

interface UseSelectableItemsProps<T> {
  items: T[]
  getId: (item: T) => string
  initialSelectedIds?: Set<string>
}

export function useSelectableItems<T>({ 
  items, 
  getId, 
  initialSelectedIds = new Set() 
}: UseSelectableItemsProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds)

  const toggleItem = useCallback((id: string) => {
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

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(getId)))
    }
  }, [items, getId, selectedIds.size])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(getId)))
  }, [items, getId])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      return newSet
    })
  }, [])

  const deselectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      ids.forEach(id => newSet.add(id))
      return newSet
    })
  }, [])

  const deselectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      ids.forEach(id => newSet.delete(id))
      return newSet
    })
  }, [])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])
  
  const getSelectedItems = useCallback(() => 
    items.filter(item => selectedIds.has(getId(item))), 
    [items, getId, selectedIds]
  )

  const getSelectedIds = useCallback(() => Array.from(selectedIds), [selectedIds])

  const selectionCount = selectedIds.size
  const isAllSelected = items.length > 0 && selectedIds.size === items.length
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < items.length

  return {
    // State
    selectedIds,
    selectionCount,
    isAllSelected,
    isPartialSelected,
    
    // Actions
    toggleItem,
    toggleAll,
    selectAll,
    clearSelection,
    selectItem,
    deselectItem,
    selectMultiple,
    deselectMultiple,
    
    // Queries
    isSelected,
    getSelectedItems,
    getSelectedIds,
    
    // Setters
    setSelectedIds
  }
}