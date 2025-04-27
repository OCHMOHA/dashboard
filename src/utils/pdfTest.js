import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const testPDF = () => {
  try {
    console.log("Creating test PDF...");
    const doc = new jsPDF();
    doc.text("Test PDF", 20, 20);
    doc.autoTable({
      head: [['Name', 'Email', 'Country']],
      body: [
        ['David', 'david@example.com', 'Sweden'],
        ['Castille', 'castille@example.com', 'Spain']
      ],
    });
    doc.save("test.pdf");
    console.log("Test PDF created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating test PDF:", error);
    return false;
  }
}; 