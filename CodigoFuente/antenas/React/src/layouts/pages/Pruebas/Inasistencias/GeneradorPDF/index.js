// src/utils/PDFGenerator.js
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generatePDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 50;
  page.drawText("Reporte de Errores de Inasistencias", {
    x: 165,
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
  const colX = [50, 110, 200, 300, 380, 450, 520];

  // Fondo celeste para headers
  const headerBackground = rgb(0.7, 0.9, 1); // celeste claro
  const headerTextColor = rgb(0, 0, 0); // negro

  headers.forEach((header, i) => {
    // Dibujar rectángulo de fondo
    page.drawRectangle({
      x: colX[i] - 2, // margen pequeño a la izquierda
      y: y - 2,
      width: i < colX.length - 1 ? colX[i + 1] - colX[i] : 70,
      height: 14,
      color: headerBackground,
    });

    // Dibujar texto encima
    page.drawText(header, { x: colX[i], y, size: 10, font, color: headerTextColor });
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

  // 🔹 Abrir en nueva pestaña (_blank)
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
