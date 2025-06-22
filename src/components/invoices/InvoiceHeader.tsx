
import { Button } from '@/components/ui/button';
import { Save, Send, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvoiceHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail: string;
  showPreview: boolean;
  canSend: boolean;
  templateSelector: React.ReactNode;
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
  canSend,
  templateSelector,
  onTogglePreview,
  onConvertToQuote,
  onSubmit,
  onSaveAndSend
}: InvoiceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b px-4 py-1">
      <div className="flex items-center justify-between gap-2">
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
            onClick={onConvertToQuote} 
            disabled={sendLoading}
            className="flex items-center gap-1 h-8"
          >
            ⚙️ Naar offerte
          </Button>
          <div className="h-8">
            {templateSelector}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            onClick={() => navigate('/facturen')}
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
    </div>
  );
};
