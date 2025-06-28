
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // If no tab is specified, set default tab
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'general' });
    }
    
    // Redirect old 'documents' tab to 'documenten'
    if (searchParams.get('tab') === 'documents') {
      setSearchParams({ tab: 'documents' });
    }
    
    // Redirect old 'templates-emails' and 'templates' tabs to 'documenten'
    if (searchParams.get('tab') === 'templates-emails' || searchParams.get('tab') === 'templates') {
      setSearchParams({ tab: 'documents' });
    }
  }, [searchParams, setSearchParams]);

  return <SettingsLayout />;
};

export default Settings;
