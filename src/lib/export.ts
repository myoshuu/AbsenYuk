import { NextResponse } from "next/server";

export async function exportData(rows: any[], name: string, format: string): Promise<NextResponse> {
  if (format === "pdf") {
    const pdfmakeMod = await import("pdfmake/build/pdfmake");
    const pdfmake = pdfmakeMod.default || pdfmakeMod;
    const pdfFontsMod = await import("pdfmake/build/vfs_fonts");
    const pdfFonts = pdfFontsMod.default || pdfFontsMod;
    pdfmake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

    const headers = Object.keys(rows[0] || {});
    const doc = {
      content: [
        { text: `Export ${name} - AbsenYuk`, style: "header" },
        { text: `\nDibuat: ${new Date().toLocaleString("id-ID")}\n\n` },
        {
          table: {
            headerRows: 1,
            body: [
              headers.map((h) => ({ text: h, bold: true, fillColor: "#ece7e1" })),
              ...rows.map((r) => headers.map((h) => String(r[h] || ""))),
            ],
          },
        },
      ],
      styles: { header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] } },
    };
    const pdf = pdfmake.createPdf(doc);
    const buffer = await new Promise<Buffer>((resolve) => {
      pdf.getBuffer((buf: Buffer) => resolve(buf));
    });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}-${Date.now()}.pdf"`,
      },
    });
  }

  const ExcelJSMod = await import("exceljs");
  const ExcelJS = ExcelJSMod.default || ExcelJSMod;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(name);
  const headers = Object.keys(rows[0] || {});
  ws.addRow(headers);
  rows.forEach((r) => ws.addRow(headers.map((h) => r[h])));
  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buffer) as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}-${Date.now()}.xlsx"`,
    },
  });
}
