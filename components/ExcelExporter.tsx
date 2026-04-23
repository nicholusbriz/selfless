import React from 'react';

interface ExcelExporterProps {
  data: Record<string, string>[];
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ExcelExporter({
  data,
  filename = 'registered-students.csv',
  className = '',
  children
}: ExcelExporterProps) {
  const downloadExcel = () => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    // Create CSV content with proper Excel formatting
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle different data types
        if (typeof value === 'string') {
          // Escape commas and quotes in strings
          const escapedValue = value.replace(/"/g, '""');
          return `"${escapedValue}"`;
        }
        return value || '';
      }).join(',')
    );

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Add UTF-8 BOM for proper Excel compatibility
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create blob and download
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={downloadExcel}
      className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 flex items-center gap-2 ${className}`}
    >
      <span className="text-lg">📊</span>
      {children || 'Download Excel'}
    </button>
  );
}
