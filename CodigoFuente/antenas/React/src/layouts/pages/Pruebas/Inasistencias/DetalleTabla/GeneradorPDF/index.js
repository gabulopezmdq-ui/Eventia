// src/utils/PDFGenerator.js
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generatePDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 50;
  page.drawText("Reporte de Procesamiento", {
    x: 200,
    y,
    size: 16,
    font,
    color: rgb(0, 0.53, 0.71),
  });

  y -= 40;

  // Encabezados de tabla
  page.drawText("Campo", { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });
  page.drawText("Valor", { x: 250, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= 20;

  // Pintamos las claves y valores
  Object.entries(data).forEach(([key, value]) => {
    page.drawText(String(key), { x: 50, y, size: 10, font });
    page.drawText(String(value), { x: 250, y, size: 10, font });
    y -= 15;
  });

  const pdfBytes = await pdfDoc.save();

  // Descargar
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "procesamiento.pdf";
  link.click();
}
