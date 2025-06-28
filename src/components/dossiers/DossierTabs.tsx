
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DossierTabsProps {
  children: React.ReactNode;
}

export const DossierTabs = ({ children }: DossierTabsProps) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="overzicht" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
          <TabsTrigger value="financieel">Financieel</TabsTrigger>
          <TabsTrigger value="documenten">Documenten</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overzicht" className="mt-0 h-full">
            <div className="p-4 space-y-4">
              {/* Key Metrics, Client Info, Internal Notes, Upcoming Deadlines, Recent Activities, Description */}
              {childrenArray}
            </div>
          </TabsContent>
          
          <TabsContent value="financieel" className="mt-0 h-full">
            <div className="p-4 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-4">Financiële Informatie</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Totale waarde</p>
                    <p className="text-slate-900">€3.500</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Gefactureerd</p>
                    <p className="text-slate-900">€2.100</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Openstaand</p>
                    <p className="text-slate-900">€1.400</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Uren besteed</p>
                    <p className="text-slate-900">14.5h</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documenten" className="mt-0 h-full">
            <div className="p-4 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-4">Documenten</h3>
                <div className="text-slate-600">Geen documenten gevonden voor dit dossier.</div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
