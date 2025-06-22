
import { Button } from '@/components/ui/button';
import { Save, Send, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuoteHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail?: string;
  showPreview: boolean;
  canSend: boolean;
  templateSelector: React.ReactNode;
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
  templateSelector,
  onTogglePreview,
  onConvertToInvoice,
  onSubmit,
  onSaveAndSend
}: QuoteHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b px-4 py-2">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onTogglePreview}
          className="flex items-center gap-1 h-8"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? 'Verberg voorbeeld' : 'Voorbeeld'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onConvertToInvoice} 
          disabled={sendLoading}
          className="flex items-center gap-1 h-8"
        >
          ⚙️ Naar factuur
        </Button>
        
        <div className="h-8">
          {templateSelector}
        </div>
        
        <Button 
          type="button" 
          onClick={() => navigate('/offertes')}
          variant="outline"
          size="sm"
          className="h-8"
        >
          Annuleren
        </Button>
        
        <Button 
          onClick={onSubmit} 
          disabled={loading}
          variant="outline"
          size="sm"
          className="h-8"
        >
          <Save className="h-4 w-4 mr-1" />
          {loading ? 'Opslaan...' : 'Opslaan als concept'}
        </Button>
        
        <Button 
          onClick={onSaveAndSend} 
          disabled={sendLoading || !canSend}
          size="sm"
          className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:text-gray-500 h-8"
        >
          <Send className="h-4 w-4 mr-1" />
          {sendLoading ? 'Versturen...' : 'Versturen'}
        </Button>
      </div>
    </div>
  );
};
