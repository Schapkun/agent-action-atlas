
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface WebhookSettingsDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  incomingBearerToken: string;
  outgoingWebhookUrl: string;
  setOutgoingWebhookUrl: (url: string) => void;
  outgoingBearerToken: string;
  setOutgoingBearerToken: (token: string) => void;
  generateIncomingWebhookUrl: () => string;
  generateNewBearerToken: () => string;
  saveSettings: () => Promise<boolean>;
  isSaving: boolean;
}

export const WebhookSettingsDialog = ({
  showDialog,
  setShowDialog,
  incomingBearerToken,
  outgoingWebhookUrl,
  setOutgoingWebhookUrl,
  outgoingBearerToken,
  setOutgoingBearerToken,
  generateIncomingWebhookUrl,
  generateNewBearerToken,
  saveSettings,
  isSaving
}: WebhookSettingsDialogProps) => {
  const { toast } = useToast();
  const { selectedWorkspace } = useOrganization();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Gekopieerd",
        description: `${label} is naar het klembord gekopieerd`
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon niet kopiëren naar klembord",
        variant: "destructive"
      });
    }
  };

  const handleGenerateToken = () => {
    generateNewBearerToken();
    toast({
      title: "Token Gegenereerd",
      description: "Nieuwe bearer token is gegenereerd"
    });
  };

  const handleSaveAndClose = async () => {
    console.log('Save and close button clicked');
    const success = await saveSettings();
    if (success) {
      console.log('Settings saved successfully, closing dialog');
      setShowDialog(false);
    } else {
      console.log('Failed to save settings, keeping dialog open');
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Webhook Instellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>WhatsApp API Instellingen</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Inkomende berichten sectie */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">Inkomende Berichten</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="webhook-url"
                    value={generateIncomingWebhookUrl()}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(generateIncomingWebhookUrl(), "Webhook URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Gebruik deze URL in je WhatsApp Business API configuratie. Deze URL is uniek voor werkruimte: {selectedWorkspace?.name || 'Geen werkruimte geselecteerd'}
                </p>
              </div>
              
              <div>
                <Label htmlFor="bearer-token">Bearer Token</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="bearer-token"
                    type="text"
                    value={incomingBearerToken}
                    readOnly
                    placeholder="Klik op 'Genereren' om een token te maken"
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateToken}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Genereren
                  </Button>
                  {incomingBearerToken && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(incomingBearerToken, "Bearer Token")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Gebruik deze token voor authenticatie in je WhatsApp API configuratie
                </p>
              </div>
            </div>
          </div>

          {/* Uitgaande berichten sectie */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-gray-900 mb-4">Uitgaande Berichten</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="outgoing-webhook-url">Webhook URL voor uitgaande berichten</Label>
                <Input
                  id="outgoing-webhook-url"
                  type="url"
                  value={outgoingWebhookUrl}
                  onChange={(e) => setOutgoingWebhookUrl(e.target.value)}
                  placeholder="https://jouw-whatsapp-api.com/send"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL van je WhatsApp API voor het versturen van berichten
                </p>
              </div>
              
              <div>
                <Label htmlFor="outgoing-bearer-token">Bearer Token voor uitgaande berichten</Label>
                <Input
                  id="outgoing-bearer-token"
                  type="password"
                  value={outgoingBearerToken}
                  onChange={(e) => setOutgoingBearerToken(e.target.value)}
                  placeholder="Bearer token van je WhatsApp API"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bearer token voor authenticatie bij je WhatsApp API
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveAndClose}
            disabled={isSaving || !incomingBearerToken.trim() || !selectedWorkspace}
            className="w-full"
          >
            {isSaving ? 'Opslaan...' : 'Instellingen Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
