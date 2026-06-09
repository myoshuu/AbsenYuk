'use strict';

const path = require('path');
const ExcelJS = require('exceljs');
const PdfPrinter = require('pdfmake');

const fontPath = path.join(__dirname);
const fonts = {
  Roboto: {
    normal: path.join(fontPath, 'Roboto-Medium.ttf'),
    bold: path.join(fontPath, 'Roboto-Medium.ttf'),
    italics: path.join(fontPath, 'Roboto-Medium.ttf'),
    bolditalics: path.join(fontPath, 'Roboto-Medium.ttf')
  }
};
const printer = new PdfPrinter(fonts);

function nowStr() {
  return new Date().toLocaleString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

async function generateExcel(rows, columns, title) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Data');
  const colCount = columns.length;

  // Title row
  const titleCell = ws.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  // Timestamp row
  const timeCell = ws.getCell(2, 1);
  timeCell.value = `Di Export pada: ${nowStr()}`;
  timeCell.font = { size: 10, color: { argb: 'FF666666' } };
  timeCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Header row
  const headerRow = ws.addRow(columns.map((c) => c.label));
  headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Data rows
  for (const row of rows) {
    const r = ws.addRow(columns.map((c) => row[c.key] ?? '-'));
    r.alignment = { vertical: 'middle' };
    r.eachCell((cell) => {
      cell.font = { size: 10 };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  }

  // Footer
  const footerCell = ws.getCell(ws.rowCount + 1, 1);
  footerCell.value = 'AbsenYuk — Event Organizer & Absensi';
  footerCell.font = { italic: true, size: 9, color: { argb: 'FF999999' } };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

  columns.forEach((_, i) => ws.getColumn(i + 1).width = 26);
  ws.getRow(4).height = 22;

  return await wb.xlsx.writeBuffer();
}

function generatePdf(rows, columns, title) {
  const headerRow = columns.map((c) => ({ text: c.label, style: 'tableHeader' }));
  const bodyRows = rows.map((row) => columns.map((c) => ({ text: String(row[c.key] ?? '-'), style: 'tableData' })));

  const docDef = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    content: [
      { text: title, style: 'title' },
      { text: '', margin: [0, 0, 0, 4] },
      { text: `Di Export pada: ${nowStr()}`, style: 'timestamp' },
      { text: '', margin: [0, 8, 0, 4] },
      { table: { headerRows: 1, widths: columns.map(() => '*'), body: [headerRow, ...bodyRows] }, layout: 'lightHorizontalLines' },
      { text: '', margin: [0, 16, 0, 0] },
      { text: 'AbsenYuk — Event Organizer & Absensi', style: 'footer' }
    ],
    styles: {
      title: { fontSize: 16, bold: true, color: '#FFFFFF', alignment: 'center', margin: [10, 10, 10, 10] },
      timestamp: { fontSize: 10, color: '#666666', alignment: 'center', margin: [0, 0, 0, 0] },
      tableHeader: { fontSize: 10, bold: true, color: '#FFFFFF', fillColor: '#000000', margin: [4, 4, 4, 4] },
      tableData: { fontSize: 9, margin: [4, 3, 4, 3] },
      footer: { fontSize: 9, italics: true, color: '#999999', alignment: 'center' }
    },
    defaultStyle: { font: 'Roboto' }
  };

  return printer.createPdfKitDocument(docDef);
}

module.exports = { generateExcel, generatePdf };
