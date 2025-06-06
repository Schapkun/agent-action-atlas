
import jsPDF from 'jspdf';

export const generatePDF = (type: string, content: any) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  switch (type) {
    case 'dagvaarding':
      return generateDagvaarding(doc, content);
    case 'vonnis':
      return generateVonnis(doc, content);
    case 'ingebreke':
      return generateIngebrekestelling(doc, content);
    case 'contract':
      return generateContract(doc, content);
    case 'factuur':
      return generateFactuur(doc, content);
    default:
      return generateGenericDocument(doc, content);
  }
};

const generateDagvaarding = (doc: jsPDF, content: any) => {
  doc.setFontSize(16);
  doc.text('DAGVAARDING', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('RECHTBANK AMSTERDAM', 105, 50, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text('Zaaknummer: C/13/123456/HA ZA 24-001', 20, 80);
  doc.text('Datum: 10 juni 2025', 20, 90);
  
  doc.text('EISER:', 20, 110);
  doc.text('ABC Holding B.V.', 20, 120);
  doc.text('Vertegenwoordigd door mr. J. Advocaat', 20, 130);
  
  doc.text('VERWEERDER:', 20, 150);
  doc.text('DEF Services B.V.', 20, 160);
  
  doc.text('PETITUM', 20, 180);
  doc.text('Eiser vordert bij vonnis, voor zover mogelijk uitvoerbaar bij voorraad:', 20, 190);
  doc.text('1. Veroordeling van verweerder tot betaling van € 25.000,-', 20, 200);
  doc.text('2. Veroordeling van verweerder in de proceskosten', 20, 210);
  
  doc.text('GRONDEN', 20, 230);
  doc.text('Partijen zijn op 15 maart 2024 een overeenkomst aangegaan...', 20, 240);
  
  return doc;
};

const generateVonnis = (doc: jsPDF, content: any) => {
  doc.setFontSize(16);
  doc.text('VONNIS', 105, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('RECHTBANK AMSTERDAM', 105, 50, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text('Zaaknummer: C/13/123456/HA ZA 24-002', 20, 80);
  doc.text('Datum: 12 juni 2025', 20, 90);
  
  doc.text('IN DE ZAAK VAN:', 20, 110);
  doc.text('Jan Janssen, eisende partij', 20, 120);
  doc.text('tegen', 20, 140);
  doc.text('Werkgever X B.V., verwerende partij', 20, 150);
  
  doc.text('UITSPRAAK', 20, 170);
  doc.text('De rechtbank:', 20, 180);
  doc.text('1. verklaart het ontslag nietig', 20, 190);
  doc.text('2. veroordeelt verweerder tot betaling van € 15.000,- smartengeld', 20, 200);
  doc.text('3. veroordeelt verweerder in de proceskosten', 20, 210);
  
  return doc;
};

const generateIngebrekestelling = (doc: jsPDF, content: any) => {
  doc.setFontSize(14);
  doc.text('INGEBREKESTELLING', 20, 30);
  
  doc.setFontSize(11);
  doc.text('Datum: 14 juni 2025', 20, 60);
  doc.text('Aan: XYZ Corp', 20, 80);
  doc.text('Betreft: Achterstallige betalingen', 20, 100);
  
  doc.text('Geachte heer/mevrouw,', 20, 120);
  doc.text('Hierbij stel ik u in gebreke ter zake van de niet nakoming van uw', 20, 140);
  doc.text('betalingsverplichting uit hoofde van onze factuur d.d. 1 maart 2025.', 20, 150);
  
  doc.text('U dient binnen 14 dagen na ontvangst van deze brief het openstaande', 20, 170);
  doc.text('bedrag van € 12.500,- te voldoen.', 20, 180);
  
  doc.text('Indien u niet tijdig betaalt, zal juridische actie worden ondernomen.', 20, 200);
  
  doc.text('Hoogachtend,', 20, 220);
  doc.text('Mr. J. Advocaat', 20, 240);
  
  return doc;
};

const generateContract = (doc: jsPDF, content: any) => {
  doc.setFontSize(14);
  doc.text('ARBEIDSCONTRACT', 20, 30);
  
  doc.setFontSize(11);
  doc.text('Datum: 15 juni 2025', 20, 60);
  doc.text('Tussen:', 20, 80);
  doc.text('XYZ Corp, werkgever', 20, 90);
  doc.text('en', 20, 110);
  doc.text('Medewerker X, werknemer', 20, 120);
  
  doc.text('ARTIKEL 1 - FUNCTIE', 20, 140);
  doc.text('Werknemer wordt aangesteld als Senior Adviseur', 20, 150);
  
  doc.text('ARTIKEL 2 - SALARIS', 20, 170);
  doc.text('Het bruto maandsalaris bedraagt € 4.500,-', 20, 180);
  
  doc.text('ARTIKEL 3 - PROEFTIJD', 20, 200);
  doc.text('Er geldt een proeftijd van 2 maanden', 20, 210);
  
  return doc;
};

const generateFactuur = (doc: jsPDF, content: any) => {
  doc.setFontSize(16);
  doc.text('FACTUUR', 20, 30);
  
  doc.setFontSize(11);
  doc.text('Factuurnummer: 2024-001', 20, 60);
  doc.text('Datum: 15 juni 2025', 20, 70);
  doc.text('Vervaldatum: 29 juni 2025', 20, 80);
  
  doc.text('FACTUURADRES:', 20, 100);
  doc.text('ABC Holding B.V.', 20, 110);
  doc.text('Hoofdstraat 123', 20, 120);
  doc.text('1000 AB Amsterdam', 20, 130);
  
  doc.text('OMSCHRIJVING', 20, 160);
  doc.text('Juridische dienstverlening periode mei 2025', 20, 170);
  doc.text('- Bestudering contracten: 8 uur à € 250,-', 30, 180);
  doc.text('- Correspondentie: 2 uur à € 250,-', 30, 190);
  
  doc.text('Subtotaal: € 2.500,-', 120, 210);
  doc.text('BTW 21%: € 525,-', 120, 220);
  doc.text('Totaal: € 3.025,-', 120, 230);
  
  return doc;
};

const generateGenericDocument = (doc: jsPDF, content: any) => {
  doc.setFontSize(14);
  doc.text('JURIDISCH DOCUMENT', 20, 30);
  
  doc.setFontSize(11);
  doc.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, 20, 60);
  doc.text('Dit is een voorbeelddocument gegenereerd door het systeem.', 20, 80);
  
  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(filename);
};
