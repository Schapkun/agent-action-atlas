
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HtmlEditor } from './builder/HtmlEditor';
import { LivePreview } from './components/LivePreview';
import { useDirectSave } from './hooks/useDirectSave';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface HtmlDocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

interface ProfileContent {
  [profileId: string]: string;
}

interface Profile {
  id: string;
  name: string;
  description: string;
}

const DEFAULT_PROFILES: Profile[] = [
  { id: 'profiel-1', name: 'Profiel 1', description: 'Standaard profiel' },
  { id: 'profiel-2', name: 'Profiel 2', description: 'Alternatief profiel' },
  { id: 'profiel-3', name: 'Profiel 3', description: 'Extra profiel' },
];

export const HtmlDocumentBuilder = ({ documentId, onComplete }: HtmlDocumentBuilderProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState('profiel-1');
  const [profileContents, setProfileContents] = useState<ProfileContent>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { toast } = useToast();
  const { saveData, hasUnsavedChanges } = useDirectSave(documentId);
  const { templates } = useDocumentTemplates();

  // Stable reference to prevent unnecessary re-renders
  const loadDataStable = useCallback(async (profileId: string) => {
    if (!documentId) return '<h1>Document Titel</h1>\n<p>Begin hier met typen...</p>';

    try {
      const template = templates.find(t => t.id === documentId);
      if (template?.placeholder_values) {
        const profileSpecificContent = template.placeholder_values[`profile_${profileId}_content`];
        
        if (profileSpecificContent) {
          console.log('[Builder] Found saved content for profile:', profileId);
          return profileSpecificContent as string;
        }
      }
      
      console.log('[Builder] No saved content found, using default for profile:', profileId);
      return '<h1>Document Titel</h1>\n<p>Begin hier met typen...</p>';
    } catch (error) {
      console.error('[Builder] Error loading profile content:', error);
      return '<h1>Document Titel</h1>\n<p>Begin hier met typen...</p>';
    }
  }, [documentId, templates]);

  // Load content for all profiles only on initial mount
  useEffect(() => {
    if (!isInitialLoad) return;
    
    const loadAllProfileContent = async () => {
      if (!documentId) {
        setIsLoading(false);
        setIsInitialLoad(false);
        return;
      }

      try {
        setIsLoading(true);
        const newProfileContents: ProfileContent = {};
        
        for (const profile of DEFAULT_PROFILES) {
          const content = await loadDataStable(profile.id);
          newProfileContents[profile.id] = content;
        }
        
        setProfileContents(newProfileContents);
        console.log('[Builder] Initial load completed for all profiles');
      } catch (error) {
        console.error('[Builder] Error during initial load:', error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    
    loadAllProfileContent();
  }, [documentId, loadDataStable, isInitialLoad]);

  // Save current profile content when switching profiles
  const handleProfileSwitch = async (newProfileId: string) => {
    if (!documentId || selectedProfileId === newProfileId) {
      setSelectedProfileId(newProfileId);
      return;
    }

    try {
      // Save current profile content before switching
      const currentContent = profileContents[selectedProfileId];
      if (currentContent) {
        await saveData({
          layoutId: selectedProfileId,
          htmlContent: currentContent,
          lastModified: Date.now()
        });
        console.log('[Builder] Auto-saved content for profile before switch:', selectedProfileId);
      }
      
      setSelectedProfileId(newProfileId);
    } catch (error) {
      console.error('[Builder] Error saving before profile switch:', error);
      // Still switch profiles even if save fails
      setSelectedProfileId(newProfileId);
    }
  };

  const handleHtmlChange = (profileId: string, newHtml: string) => {
    setProfileContents(prev => ({
      ...prev,
      [profileId]: newHtml
    }));
  };

  const handleSaveAll = async () => {
    if (!documentId) {
      toast({
        title: "Fout",
        description: "Geen document ID beschikbaar"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Save all profiles with force flag
      for (const [profileId, content] of Object.entries(profileContents)) {
        if (content) {
          await saveData({
            layoutId: profileId,
            htmlContent: content,
            lastModified: Date.now()
          }, true); // Force save
          console.log('[Builder] Saved profile:', profileId, 'with content length:', content.length);
        }
      }
      
      toast({
        title: "Opgeslagen",
        description: "Alle profielen succesvol opgeslagen"
      });
    } catch (error) {
      console.error('[Builder] Save all failed:', error);
      toast({
        title: "Fout",
        description: "Kon document niet opslaan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onComplete(false);
  };

  const renderStyledContent = (profileId: string) => {
    const content = profileContents[profileId] || '';
    
    const styledHtml = `
      <div style="
        font-family: 'Inter', sans-serif;
        color: #1f2937;
        padding: 20px;
        background: white;
        min-height: 400px;
        line-height: 1.6;
      ">
        ${content}
      </div>
    `;

    return styledHtml;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Document laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <h2 className="text-lg font-semibold">HTML Document Builder - Profielen</h2>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
              Niet-opgeslagen wijzigingen
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveAll}
            disabled={isSaving || !documentId}
            size="sm"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </Button>
          <Button
            onClick={handleClose}
            size="sm"
          >
            Sluiten
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Profile Tabs & Editors */}
        <div className="w-1/2 flex flex-col border-r">
          <Tabs value={selectedProfileId} onValueChange={handleProfileSwitch} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-white border-b">
              {DEFAULT_PROFILES.map((profile) => (
                <TabsTrigger 
                  key={profile.id} 
                  value={profile.id}
                  className="text-sm"
                >
                  {profile.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {DEFAULT_PROFILES.map((profile) => (
              <TabsContent key={profile.id} value={profile.id} className="flex-1 m-0">
                <div className="h-full flex flex-col">
                  <div className="p-3 bg-white border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border bg-blue-500"/>
                      <h3 className="font-medium text-sm">{profile.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{profile.description}</p>
                  </div>
                  
                  <div className="flex-1">
                    <HtmlEditor
                      htmlContent={profileContents[profile.id] || ''}
                      onChange={(newHtml) => handleHtmlChange(profile.id, newHtml)}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2">
          <LivePreview
            htmlContent={renderStyledContent(selectedProfileId)}
            layoutId={selectedProfileId}
          />
        </div>
      </div>
    </div>
  );
};
