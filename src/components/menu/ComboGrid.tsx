"use client"

import { useState, useEffect } from 'react'
import ComboCard from './ComboCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'

interface ComboItem {
  id: string
  productId: string
  productName: string
  quantity: number
  isOptional: boolean
  displayOrder: number
  productStock: number
  isItemAvailable: boolean
}

interface Combo {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  isActive: boolean
  isFeatured: boolean
  preparationTime?: number
  displayOrder: number
  isAvailable: boolean
  comboItems: ComboItem[]
}

interface ComboGridProps {
  combos: Combo[]
  showAdminControls?: boolean
  onEditCombo?: (combo: Combo) => void
  onDeleteCombo?: (id: string) => void
  onToggleComboActive?: (id: string) => void
  onToggleComboFeatured?: (id: string) => void
  onAddCombo?: () => void
  onAddToCart?: (combo: Combo) => void
}

export default function ComboGrid({
  combos,
  showAdminControls = false,
  onEditCombo,
  onDeleteCombo,
  onToggleComboActive,
  onToggleComboFeatured,
  onAddCombo,
  onAddToCart
}: ComboGridProps) {
  const [filteredCombos, setFilteredCombos] = useState<Combo[]>(combos)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let filtered = combos

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(combo =>
        combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        combo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by active status for public view
    if (!showAdminControls) {
      filtered = filtered.filter(combo => combo.isActive && combo.isAvailable)
    }

    setFilteredCombos(filtered)
  }, [combos, searchTerm, showAdminControls])

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar combos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {showAdminControls && onAddCombo && (
          <Button onClick={onAddCombo}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Combo
          </Button>
        )}
      </div>

      {/* Combos grid */}
      {filteredCombos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Nenhum combo encontrado com os filtros selecionados.'
              : 'Nenhum combo cadastrado.'
            }
          </p>
          {showAdminControls && onAddCombo && (
            <Button onClick={onAddCombo} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro combo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCombos.map((combo) => (
            <ComboCard
              key={combo.id}
              combo={combo}
              showAdminControls={showAdminControls}
              onEdit={onEditCombo}
              onDelete={onDeleteCombo}
              onToggleStatus={onToggleComboActive}
              onToggleFeatured={onToggleComboFeatured}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}