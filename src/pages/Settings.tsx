
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'organizations';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    // If no tab is specified, set default tab
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'organizations' });
    }
  }, [searchParams, setSearchParams]);

  return <SettingsLayout currentTab={currentTab} onTabChange={handleTabChange} />;
};

export default Settings;
