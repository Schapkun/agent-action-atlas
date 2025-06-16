
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
  // Restore working submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 ContactDialogTabs: Submit triggered - saving contact');
    onSubmit(e);
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="klant" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="klant" className="text-xs">Klant</TabsTrigger>
          <TabsTrigger value="document" className="text-xs">Document</TabsTrigger>
          <TabsTrigger value="verzending" className="text-xs">Verzending en betaling</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="klant" className="h-full">
                <ContactFormData formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="document" className="h-full">
                <ContactDocumentTab formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="verzending" className="h-full">
                <ContactShippingTab formData={formData} setFormData={setFormData} />
              </TabsContent>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t mt-4 flex-shrink-0">
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
  );
};
