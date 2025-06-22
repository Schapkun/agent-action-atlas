
import { Button } from '@/components/ui/button';
import { Save, Send, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuoteHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail?: string;
  showPreview: boolean;
  canSend: boolean;
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
  canSend,
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
        </div>
        
        <div className="flex items-center gap-2">
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
            disabled={sendLoading || !canSend}
            size="sm"
            className="bg-gray-800 hover:bg-gray-900 text-xs disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Send className="h-3 w-3 mr-1" />
            {sendLoading ? 'Versturen...' : 'Versturen'}
          </Button>
        </div>
      </div>
    </div>
  );
};
