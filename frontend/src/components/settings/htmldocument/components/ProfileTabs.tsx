
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HtmlEditor } from '../builder/HtmlEditor';

interface Profile {
  id: string;
  name: string;
  description: string;
}

interface ProfileTabsProps {
  profiles: Profile[];
  selectedProfileId: string;
  profileContents: Record<string, string>;
  onProfileSwitch: (profileId: string) => void;
  onHtmlChange: (profileId: string, content: string) => void;
}

export const ProfileTabs = ({
  profiles,
  selectedProfileId,
  profileContents,
  onProfileSwitch,
  onHtmlChange
}: ProfileTabsProps) => {
  return (
    <Tabs value={selectedProfileId} onValueChange={onProfileSwitch} className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-3 bg-white border-b">
        {profiles.map((profile) => (
          <TabsTrigger 
            key={profile.id} 
            value={profile.id}
            className="text-sm"
          >
            {profile.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {profiles.map((profile) => (
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
                onChange={(newHtml) => onHtmlChange(profile.id, newHtml)}
              />
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
