
import { ContactFormData } from './ContactFormData';

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
        <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
};
