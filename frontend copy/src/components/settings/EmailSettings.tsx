
import React from 'react';
import { EmailTemplateList } from './components/EmailTemplateList';

export const EmailSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Email Templates</h3>
        <p className="text-sm text-muted-foreground">
          Beheer email templates voor facturen en herinneringen.
        </p>
      </div>
      
      <EmailTemplateList />
    </div>
  );
};
