/**
 * Utility functions for CSV export
 */

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If the value contains comma, newline, or quote, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an array of objects to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  const rows: string[] = [];
  
  // Add header row
  rows.push(headers.map(escapeCSV).join(','));
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      // Handle nested properties (e.g., "order.items")
      const value = header.split('.').reduce((obj, key) => obj?.[key], item);
      return escapeCSV(value);
    });
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

/**
 * Downloads a CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for UTF-8 to ensure Excel opens it correctly
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

