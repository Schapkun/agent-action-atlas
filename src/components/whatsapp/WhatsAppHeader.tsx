
import { useOrganization } from '@/contexts/OrganizationContext';
import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';
import { WebhookSettingsDialog } from './WebhookSettingsDialog';

interface WhatsAppHeaderProps {
  incomingBearerToken: string;
  outgoingWebhookUrl: string;
  setOutgoingWebhookUrl: (url: string) => void;
  outgoingBearerToken: string;
  setOutgoingBearerToken: (token: string) => void;
  showWebhookDialog: boolean;
  setShowWebhookDialog: (show: boolean) => void;
  generateIncomingWebhookUrl: () => string;
  generateNewBearerToken: () => string;
  saveSettings: () => Promise<boolean>;
  webhookConfigured: boolean;
  isSaving: boolean;
}

export const WhatsAppHeader = ({
  incomingBearerToken,
  outgoingWebhookUrl,
  setOutgoingWebhookUrl,
  outgoingBearerToken,
  setOutgoingBearerToken,
  showWebhookDialog,
  setShowWebhookDialog,
  generateIncomingWebhookUrl,
  generateNewBearerToken,
  saveSettings,
  webhookConfigured,
  isSaving
}: WhatsAppHeaderProps) => {
  const { selectedWorkspace } = useOrganization();
  const { isConnected } = useWhatsAppConnection();

  const isWhatsAppConfigured = webhookConfigured && incomingBearerToken && outgoingWebhookUrl;

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">WhatsApp</h1>
          {selectedWorkspace && (
            <span className="text-sm text-gray-500">Werkruimte: {selectedWorkspace.name}</span>
          )}
          <div className="flex items-center gap-2">
            {isWhatsAppConfigured && isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Verbonden</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Niet verbonden</span>
              </div>
            )}
          </div>
          {/* Debug info */}
          <div className="text-xs text-gray-400">
            Token: {incomingBearerToken ? `${incomingBearerToken.substring(0, 10)}...` : 'Niet geladen'}
          </div>
        </div>
        <WebhookSettingsDialog
          showDialog={showWebhookDialog}
          setShowDialog={setShowWebhookDialog}
          incomingBearerToken={incomingBearerToken}
          outgoingWebhookUrl={outgoingWebhookUrl}
          setOutgoingWebhookUrl={setOutgoingWebhookUrl}
          outgoingBearerToken={outgoingBearerToken}
          setOutgoingBearerToken={setOutgoingBearerToken}
          generateIncomingWebhookUrl={generateIncomingWebhookUrl}
          generateNewBearerToken={generateNewBearerToken}
          saveSettings={saveSettings}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};
