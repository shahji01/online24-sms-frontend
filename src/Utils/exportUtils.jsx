import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data, fileName = 'data') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, fileName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToCSV = (data, fileName = 'data') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (columns, rows, title = 'Data', fileName = 'data') => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 10,
  });
  doc.save(`${fileName}.pdf`);
};
