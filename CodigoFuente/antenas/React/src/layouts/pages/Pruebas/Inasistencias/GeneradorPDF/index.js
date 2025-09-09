import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generatePDF(data) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]); // 👈 usamos let
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

  const drawHeaders = (pg, yPos) => {
    headers.forEach((header, i) => {
      // Dibujar rectángulo de fondo
      pg.drawRectangle({
        x: colX[i] - 2,
        y: yPos - 2,
        width: i < colX.length - 1 ? colX[i + 1] - colX[i] : 70,
        height: 14,
        color: headerBackground,
      });

      // Dibujar texto encima
      pg.drawText(header, {
        x: colX[i],
        y: yPos,
        size: 10,
        font,
        color: headerTextColor,
      });
    });
  };

  // Dibujamos los headers de la primera página
  drawHeaders(page, y);
  y -= 20;

  // 🔹 Recorremos cada error del array
  data.forEach((item) => {
    // Si no hay espacio, agregamos nueva página y volvemos a dibujar headers
    if (y < 50) {
      page = pdfDoc.addPage([600, 800]); // 👈 nueva página
      y = height - 50;
      drawHeaders(page, y);
      y -= 20;
    }

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
  });

  const pdfBytes = await pdfDoc.save();

  // 🔹 Abrir en nueva pestaña (_blank)
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
