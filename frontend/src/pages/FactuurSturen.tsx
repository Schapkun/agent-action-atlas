
import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FactuurSturen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewTab = () => {
    window.open('https://www.factuursturen.nl', '_blank', 'noopener,noreferrer');
  };

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Alert className="max-w-md mb-4">
          <AlertDescription>
            De website kan niet worden geladen in een iframe. Klik op de knop hieronder om factuursturen.nl in een nieuw tabblad te openen.
          </AlertDescription>
        </Alert>
        <Button onClick={openInNewTab} className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Open factuursturen.nl
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Laden van factuursturen.nl...</span>
          </div>
        </div>
      )}
      <iframe
        src="https://www.factuursturen.nl"
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="FactuurSturen.nl"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default FactuurSturen;
