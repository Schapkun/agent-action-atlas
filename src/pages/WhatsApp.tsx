
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react';

const WhatsApp = () => {
  useEffect(() => {
    // Add a slight delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      window.location.href = 'https://web.whatsapp.com';
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleOpenExternal = () => {
    window.open('https://web.whatsapp.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">W</span>
            </div>
            WhatsApp Web wordt geladen...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Je wordt doorgestuurd naar WhatsApp Web. Als dit niet automatisch gebeurt, 
            gebruik dan een van de onderstaande opties.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar app
            </Button>
            
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Opnieuw proberen
            </Button>
            
            <Button 
              onClick={handleOpenExternal}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
            >
              <ExternalLink className="h-4 w-4" />
              Open in nieuw tabblad
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Tips voor beste ervaring:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Zorg dat je bent ingelogd op je WhatsApp account</li>
              <li>• Houd je telefoon verbonden met internet</li>
              <li>• Voor de beste ervaring, gebruik Chrome of Firefox</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsApp;
