
import { Button } from '@/components/ui/button';
import { Save, Send, RotateCcw, RotateCw, Eye, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuoteHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail?: string;
  showPreview: boolean;
  onTogglePreview: () => void;
  onConvertToInvoice: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSaveAndSend: () => void;
}

export const QuoteHeader = ({
  loading,
  sendLoading,
  clientEmail,
  showPreview,
  onTogglePreview,
  onConvertToInvoice,
  onSubmit,
  onSaveAndSend
}: QuoteHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium text-green-600">📄 Nieuwe Offerte</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs px-2 py-1">
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 py-1">
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTogglePreview}
            className="flex items-center gap-1 text-xs px-2 py-1"
          >
            <Eye className="h-3 w-3" />
            {showPreview ? 'Verberg voorbeeld' : 'Voorbeeld'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onConvertToInvoice} 
            disabled={sendLoading}
            className="flex items-center gap-1 text-xs px-2 py-1"
          >
            ⚙️ Naar factuur
          </Button>
          
          <div className="flex items-center gap-2 ml-4 border-l pl-4">
            <Button 
              type="button" 
              onClick={() => navigate('/offertes')}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Annuleren
            </Button>
            <Button 
              onClick={onSubmit} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {loading ? 'Opslaan...' : 'Opslaan als concept'}
            </Button>
            <Button 
              onClick={onSaveAndSend} 
              disabled={sendLoading}
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              {sendLoading ? 'Versturen...' : 'Opslaan & Versturen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
