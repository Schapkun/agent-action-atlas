
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, Save, Send, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface InvoiceHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail: string;
  showPreview: boolean;
  onTogglePreview: () => void;
  onConvertToQuote: () => void;
  onSubmit: () => void;
  onSaveAndSend: () => void;
}

export const InvoiceHeader = ({
  loading,
  sendLoading,
  clientEmail,
  showPreview,
  onTogglePreview,
  onConvertToQuote,
  onSubmit,
  onSaveAndSend
}: InvoiceHeaderProps) => {
  const navigate = useNavigate();
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const handleUndo = () => {
    if (undoStack.length > 0) {
      console.log('Undo action triggered');
      // For now, just log - in a real implementation this would restore previous state
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      console.log('Redo action triggered');
      // For now, just log - in a real implementation this would restore next state
    }
  };

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium text-green-600">📄 Nieuwe Factuur</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="text-xs px-2 py-1"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="text-xs px-2 py-1"
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={onTogglePreview}
            className="flex items-center gap-1 text-xs px-2 py-1"
          >
            <Eye className="h-3 w-3" />
            {showPreview ? 'Verberg voorbeeld' : 'Voorbeeld'}
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={onConvertToQuote} 
            className="flex items-center gap-1 text-xs px-2 py-1"
          >
            ⚙️ Naar offerte
          </Button>
          
          <div className="flex items-center gap-2 ml-4 border-l pl-4">
            <Button 
              type="button" 
              onClick={() => navigate('/facturen')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Annuleren
            </Button>
            <Button 
              type="button"
              onClick={onSubmit} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {loading ? 'Opslaan...' : 'Opslaan'}
            </Button>
            <Button 
              type="button"
              onClick={onSaveAndSend}
              disabled={sendLoading || !clientEmail}
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              {sendLoading ? 'Versturen...' : 'Versturen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
