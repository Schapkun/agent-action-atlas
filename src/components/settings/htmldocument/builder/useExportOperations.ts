
import { useToast } from '@/hooks/use-toast';
import { DocumentPDFGenerator } from '../../utils/PDFGenerator';

interface UseExportOperationsProps {
  documentName: string;
  htmlContent: string;
}

export function useExportOperations({ documentName, htmlContent }: UseExportOperationsProps) {
  const { toast } = useToast();

  const handlePDFDownload = () => {
    const fileName = documentName.trim() || 'document';
    DocumentPDFGenerator.generateFromHTML(htmlContent, fileName);
    toast({
      title: "PDF Download",
      description: `PDF wordt gedownload als "${fileName}.pdf"`
    });
  };

  const handleHTMLExport = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName.trim() || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Export",
      description: "HTML bestand is gedownload."
    });
  };

  return {
    handlePDFDownload,
    handleHTMLExport
  };
}
