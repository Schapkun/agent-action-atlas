
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DossierCategoriesManager } from './components/DossierCategoriesManager';
import { DossierStatusesManager } from './components/DossierStatusesManager';
import { CaseTypesManager } from './components/CaseTypesManager';
import { CaseStepTemplatesManager } from './components/CaseStepTemplatesManager';

export const DossierSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dossier Instellingen</h2>
        <p className="text-slate-600">
          Beheer categorieën, statussen, zaaktypen en procedure templates voor dossiers.
        </p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Categorieën</TabsTrigger>
          <TabsTrigger value="statuses">Statussen</TabsTrigger>
          <TabsTrigger value="case-types">Zaaktypen</TabsTrigger>
          <TabsTrigger value="templates">Procedure Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <DossierCategoriesManager />
        </TabsContent>

        <TabsContent value="statuses" className="space-y-6">
          <DossierStatusesManager />
        </TabsContent>

        <TabsContent value="case-types" className="space-y-6">
          <CaseTypesManager />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <CaseStepTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
