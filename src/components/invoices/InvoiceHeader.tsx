
import { Button } from '@/components/ui/button';
import { Save, Send, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface InvoiceHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail: string;
  showPreview: boolean;
  canSend: boolean;
  templateSelector: React.ReactNode;
  isSessionRecovered?: boolean;
  sessionData?: { clientName?: string } | null;
  onTogglePreview: () => void;
  onConvertToQuote: () => void;
  onSubmit: () => void;
  onSaveAndSend: () => void;
  onCancel: () => void;
}

export const InvoiceHeader = ({
  loading,
  sendLoading,
  clientEmail,
  showPreview,
  canSend,
  templateSelector,
  isSessionRecovered = false,
  sessionData,
  onTogglePreview,
  onConvertToQuote,
  onSubmit,
  onSaveAndSend,
  onCancel
}: InvoiceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Factuur aanmaken</h1>
          {isSessionRecovered && (
            <Badge 
              variant="outline" 
              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              title={sessionData?.clientName ? `Sessie hersteld voor ${sessionData.clientName}` : 'Sessie hersteld'}
            >
              Sessie hersteld
            </Badge>
          )}
        </div>
        
        <div className="flex-1" />
        
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
        
        <Button 
          type="button" 
          onClick={onCancel}
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
