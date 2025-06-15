
import { ContactFormData } from './ContactFormData';
import { ContactDocumentTab } from './ContactDocumentTab';
import { ContactShippingTab } from './ContactShippingTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContactDialogTabsProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ContactDialogTabs = ({ formData, setFormData, onSubmit, onCancel }: ContactDialogTabsProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <Tabs defaultValue="klant" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="klant" className="text-xs">Klant</TabsTrigger>
            <TabsTrigger value="document" className="text-xs">Document</TabsTrigger>
            <TabsTrigger value="verzending" className="text-xs">Verzending en betaling</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={onSubmit} className="space-y-3">
              <TabsContent value="klant" className="mt-3">
                <ContactFormData formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="document" className="mt-3">
                <ContactDocumentTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="verzending" className="mt-3">
                <ContactShippingTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              <div className="flex justify-end space-x-2 pt-3 border-t mt-4">
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs"
                >
                  Annuleren
                </button>
                <button 
                  type="submit" 
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
