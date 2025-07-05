
import React from 'react';
import { DocumentHeader } from './DocumentHeader';
import { ProfileTabs } from './ProfileTabs';
import { LivePreview } from './LivePreview';
import { useHtmlDocumentBuilder } from '../hooks/useHtmlDocumentBuilder';

interface DocumentBuilderProps {
  documentId?: string;
  onComplete: (success: boolean) => void;
}

export const DocumentBuilder = ({ documentId, onComplete }: DocumentBuilderProps) => {
  const {
    selectedProfileId,
    profileContents,
    isSaving,
    isLoading,
    templatesReady,
    hasUnsavedChanges,
    DEFAULT_PROFILES,
    handleProfileSwitch,
    handleHtmlChange,
    handleSaveAll
  } = useHtmlDocumentBuilder(documentId);

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

  if (!templatesReady || isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            {!templatesReady ? 'Templates laden...' : 'Document laden...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <DocumentHeader
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        documentId={documentId}
        onSave={handleSaveAll}
        onClose={handleClose}
      />

      <div className="flex-1 flex">
        <div className="w-1/2 flex flex-col border-r">
          <ProfileTabs
            profiles={DEFAULT_PROFILES}
            selectedProfileId={selectedProfileId}
            profileContents={profileContents}
            onProfileSwitch={handleProfileSwitch}
            onHtmlChange={handleHtmlChange}
          />
        </div>

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
