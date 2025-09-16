import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function BajasModificacionesPDF({ data, title, usuario, infoTitulos }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([750, 900]); // Página un poco más ancha
  const { width, height } = page.getSize();
  const margin = 50;
  const rowHeight = 30;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  console.log("usuarios: ", usuario);
  // --------------------
  // Dibuja el título
  // --------------------
  const titleX = margin + 200; // posición del título
  const titleY = height - 50;
  page.drawText(title, {
    x: titleX,
    y: titleY,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // --------------------
  // Dibuja la info debajo del título
  // --------------------
  const infoText = `ESTABLECIMIENTO: ${infoTitulos.establecimientos.nroEstablecimiento}    DIPREGEP Nº: ${infoTitulos.establecimientos.nroDiegep}    MES: ${infoTitulos.mes}    AÑO: ${infoTitulos.anio}`;

  // Centrar info debajo del título
  const textWidth = font.widthOfTextAtSize(infoText, 12);
  const infoX = titleX + (150 - textWidth / 2); // centrado relativo al título
  const infoY = titleY - 30; // 30 puntos debajo del título

  page.drawText(infoText, {
    x: infoX,
    y: infoY,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // --------------------
  // Definir columnas
  // --------------------
  const headers = ["DNI", "SEC", "Apellido y nombre", "Fecha Baja", "Cant Horas Baja"];
  const columnWidths = [100, 50, 300, 120, 120];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

  let yPosition = infoY - 60;

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

  yPosition -= rowHeight + 100; // separa un poco del final de la tabla

  const rectWidth = 300;
  const rectHeight = 50;
  const rectX = margin;

  // Dibuja rectángulo
  page.drawRectangle({
    x: rectX,
    y: yPosition,
    width: rectWidth,
    height: rectHeight,
    color: rgb(0.9, 0.9, 0.9),
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Fecha de entrega
  const fechaEntrega = new Date().toLocaleDateString("es-AR");
  page.drawText(`FECHA DE ENTREGA: ${fechaEntrega}`, {
    x: rectX + 10,
    y: yPosition + rectHeight - 20,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // Confeccionó
  page.drawText(`CONFECCIONÓ: ${usuario.apellidoPersona} ${usuario.nombrePersona}`, {
    x: rectX + 10,
    y: yPosition + 10,
    size: 10,
    font: fontBold,
    color: rgb(0, 0, 0),
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
