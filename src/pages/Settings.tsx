
import React from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { DocumentProvider } from '@/components/settings/contexts/DocumentContext';

const Settings = () => {
  return (
    <DocumentProvider>
      <SettingsLayout />
    </DocumentProvider>
  );
};

export default Settings;
