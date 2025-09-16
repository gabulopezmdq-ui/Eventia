import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function BajasModificacionesPDF({ data, title = "Bajas y Modificaciones" }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([750, 900]); // Página un poco más ancha
  const { width, height } = page.getSize();
  const margin = 50;
  const rowHeight = 30;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // --------------------
  // Dibuja el título
  // --------------------
  page.drawText(title, {
    x: margin + 200,
    y: height - 50,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // --------------------
  // Definir columnas
  // --------------------
  const headers = ["DNI", "SEC", "Apellido y nombre", "Fecha Baja", "Cant Horas Baja"];
  const columnWidths = [100, 50, 300, 120, 120];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  let yPosition = height - 100;

  // --------------------
  // Dibuja cabecera con fondo gris
  // --------------------
  let xPosition = margin;
  headers.forEach((header, i) => {
    const colWidth = columnWidths[i];
    page.drawRectangle({
      x: xPosition,
      y: yPosition,
      width: colWidth,
      height: rowHeight,
      color: rgb(0.8, 0.8, 0.8),
    });
    page.drawText(header, {
      x: xPosition + 5,
      y: yPosition + 8,
      size: 12,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    xPosition += colWidth;
  });

  // Línea inferior cabecera
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: margin + tableWidth, y: yPosition },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  // --------------------
  // Dibuja filas de datos con alternancia de color y líneas verticales
  // --------------------
  data.forEach((row, index) => {
    yPosition -= rowHeight;
    xPosition = margin;

    // Fondo alternado
    if (index % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: yPosition,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.95, 0.95, 0.95),
      });
    }

    const nombreApellido = row.apellido + " " + row.nombre;

    // Condición para horasDecrece
    const horas = row.tipoMovimiento === "M" && row.decrece === "S" ? row.horasDecrece : "";

    const rowData = [row.numDoc, row.sec, nombreApellido, row.fechaInicioBaja, horas];

    rowData.forEach((cell, i) => {
      const colWidth = columnWidths[i];
      // Texto
      page.drawText(String(cell ?? ""), {
        x: xPosition + 5,
        y: yPosition + 8,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      // Línea vertical derecha de la celda
      page.drawLine({
        start: { x: xPosition + colWidth, y: yPosition },
        end: { x: xPosition + colWidth, y: yPosition + rowHeight },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      xPosition += colWidth;
    });

    // Línea inferior de la fila
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: margin + tableWidth, y: yPosition },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
  });

  // --------------------
  // Pie de página con fecha y número de página
  // --------------------
  const dateStr = new Date().toLocaleDateString("es-AR");
  page.drawText(`Fecha: ${dateStr}`, {
    x: margin,
    y: 20,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Página 1`, {
    x: width - margin - 50,
    y: 20,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // --------------------
  // Guardar PDF y abrir
  // --------------------
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
