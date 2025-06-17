
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw, Save, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvoiceHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail: string;
  onConvertToQuote: () => void;
  onSubmit: () => void;
  onSaveAndSend: () => void;
}

export const InvoiceHeader = ({
  loading,
  sendLoading,
  clientEmail,
  onConvertToQuote,
  onSubmit,
  onSaveAndSend
}: InvoiceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium text-green-600">📄 Nieuwe Factuur</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs px-2 py-1">
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 py-1">
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={onConvertToQuote} className="flex items-center gap-1 text-xs px-2 py-1">
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
              onClick={onSubmit} 
              disabled={loading}
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {loading ? 'Opslaan...' : 'Opslaan'}
            </Button>
            <Button 
              onClick={onSaveAndSend}
              disabled={sendLoading || !clientEmail}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              {sendLoading ? 'Verzenden...' : 'Opslaan & Versturen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
