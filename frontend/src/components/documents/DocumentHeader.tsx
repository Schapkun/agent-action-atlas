
import { ArrowLeft, Save, Send, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DocumentHeaderProps {
  loading: boolean;
  sendLoading: boolean;
  clientEmail?: string;
  showPreview: boolean;
  onTogglePreview: () => void;
  onSubmit: () => void;
  onSaveAndSend: () => void;
}

export const DocumentHeader = ({
  loading,
  sendLoading,
  clientEmail,
  showPreview,
  onTogglePreview,
  onSubmit,
  onSaveAndSend
}: DocumentHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/documenten')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar documenten
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Document opstellen</h1>
                <p className="text-sm text-muted-foreground">
                  Maak een nieuw document aan
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Verberg preview' : 'Toon preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSubmit}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Opslaan...' : 'Opslaan'}
            </Button>
            <Button
              size="sm"
              onClick={onSaveAndSend}
              disabled={sendLoading || !clientEmail}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sendLoading ? 'Verzenden...' : 'Opslaan & Verzenden'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
