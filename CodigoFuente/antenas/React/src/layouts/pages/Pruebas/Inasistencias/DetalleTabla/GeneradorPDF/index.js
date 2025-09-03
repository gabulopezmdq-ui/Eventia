// src/utils/PDFGenerator.js
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generatePDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 50;
  page.drawText("Reporte de Errores de Inasistencias", {
    x: 150,
    y,
    size: 16,
    font,
    color: rgb(0, 0.53, 0.71),
  });

  y -= 40;

  // 🔹 Encabezados de tabla
  const headers = [
    "ID Error",
    "ID Cabecera",
    "ID Detalle",
    "Documento",
    "Legajo",
    "POF",
    "POF Barra",
  ];
  const colX = [50, 110, 200, 300, 380, 450, 520]; // posiciones en X para cada columna

  headers.forEach((header, i) => {
    page.drawText(header, { x: colX[i], y, size: 10, font, color: rgb(0, 0, 0) });
  });

  y -= 20;

  // 🔹 Recorremos cada error del array
  data.forEach((item) => {
    const values = [
      item.idTMPErrorInasistencia,
      item.idCabeceraInasistencia,
      item.idTMPInasistenciasDetalle,
      item.documento,
      item.legajo,
      item.pof,
      item.pofBarra,
    ];

    values.forEach((val, i) => {
      page.drawText(String(val ?? ""), { x: colX[i], y, size: 9, font });
    });

    y -= 15;

    // Si llegamos al final de la página, agregamos otra
    if (y < 50) {
      y = height - 50;
      page.addPage();
    }
  });

  const pdfBytes = await pdfDoc.save();

  // 🔹 Descargar
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "errores_inasistencias.pdf";
  link.click();
}
