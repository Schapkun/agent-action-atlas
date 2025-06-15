
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactFormData } from './ContactFormData';
import { InvoiceFormData } from './InvoiceFormData';

interface ContactDialogTabsProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ContactDialogTabs = ({ formData, setFormData, onSubmit, onCancel }: ContactDialogTabsProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="klant" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="klant">Klant</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="verzending">Verzending en betaling</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="klant" className="space-y-4 mt-0">
            <form onSubmit={onSubmit} className="space-y-4">
              <ContactFormData formData={formData} setFormData={setFormData} />

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuleren
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="document" className="mt-0">
            <InvoiceFormData formData={formData} setFormData={setFormData} />
          </TabsContent>
          
          <TabsContent value="verzending" className="mt-0">
            <div className="p-4 text-center text-gray-500">
              Verzending en betaling instellingen komen hier
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
