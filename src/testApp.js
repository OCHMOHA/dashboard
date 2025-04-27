import React from 'react';
import { testPDF } from './utils/pdfTest';

function TestApp() {
  const handleClick = () => {
    console.log("Testing PDF generation...");
    const result = testPDF();
    console.log("PDF test result:", result);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF Test</h1>
        <button onClick={handleClick}>Generate Test PDF</button>
      </header>
    </div>
  );
}

export default TestApp; 