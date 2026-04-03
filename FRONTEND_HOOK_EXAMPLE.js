// Add this to your frontend (public/app.js or wherever exports are handled)

/**
 * Premium PDF Export Handler
 * Hook this to a button in your UI
 */

async function exportPremiumPDF(blueprint) {
  try {
    console.log('📄 Generating premium PDF...');
    
    // Call the backend API
    const response = await fetch('/api/export/premium-report-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}` // if needed
      },
      body: JSON.stringify({ blueprint })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'PDF generation failed');
    }

    // Convert response to blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${blueprint.name || 'startup'}-report.pdf`;
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log('✅ PDF downloaded successfully!');
  } catch (error) {
    console.error('❌ PDF export failed:', error);
    alert(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Example: Add to your export button
 * 
 * // In your HTML
 * <button id="export-pdf-btn">📄 Export Premium PDF</button>
 * 
 * // In your JavaScript
 * document.getElementById('export-pdf-btn').addEventListener('click', () => {
 *   exportPremiumPDF(yourBlueprint);
 * });
 */

// If using React:
export function ExportPDFButton({ blueprint }) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await exportPremiumPDF(blueprint);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={loading}
      className="btn-premium-pdf"
    >
      {loading ? '⏳ Generating...' : '📄 Export Premium PDF'}
    </button>
  );
}

// If using plain HTML:
document.getElementById('export-premium-pdf').addEventListener('click', () => {
  exportPremiumPDF(yourBlueprintData);
});
