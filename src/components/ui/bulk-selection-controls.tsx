import { Button } from '@/components/ui/button'
import { Square, CheckSquare, X, Edit3 } from 'lucide-react'
import { toast } from 'sonner'

interface BulkSelectionControlsProps {
  itemCount: number
  selectedCount: number
  isAllSelected: boolean
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkEdit?: () => void
  entityName: string
  bulkEditDisabled?: boolean
}

export function BulkSelectionControls({
  itemCount,
  selectedCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onBulkEdit,
  entityName,
  bulkEditDisabled = false
}: BulkSelectionControlsProps) {
  if (itemCount === 0) return null

  return (
    <div className="mb-4 p-4 bg-card border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onSelectAll}
            className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
            <span>
              {isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
            </span>
          </button>
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Limpar seleção
            </Button>
            {onBulkEdit && (
              <Button
                variant="default"
                size="sm"
                onClick={bulkEditDisabled 
                  ? () => toast.info(`Edição em massa de ${entityName} em desenvolvimento`)
                  : onBulkEdit
                }
                disabled={bulkEditDisabled}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar ({selectedCount})
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}