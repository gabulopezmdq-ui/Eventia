import React from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import logo from "../../../../assets/images/Logo1.png";

const generar = async () => {
  console.log("Entre a GeneradorPDF");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 horizontal
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 8;
  // 1. AGREGAR EL LOGO (NUEVO)
  // Cargar la imagen y convertirla a Uint8Array
  const response = await fetch(logo);
  const imageBytes = await response.arrayBuffer();
  const image = await pdfDoc.embedPng(imageBytes);
  // Reducir la imagen al 50%
  const logoWidth = image.width * 0.7;
  const logoHeight = image.height * 0.7;

  // Dibujar el logo centrado en la parte superior
  page.drawImage(image, {
    x: width - logoWidth - 40, // eje horizontal
    y: height - 50, // Posición vertical (ajustar según necesidad)
    width: logoWidth,
    height: logoHeight,
  });

  // Título
  const titulo = "PLANILLA DE MOVIMIENTO";
  page.drawText(titulo, {
    x: (width - font.widthOfTextAtSize(titulo, 12)) / 2,
    y: height - 70,
    size: 12,
    font,
  });

  // Recuadro ALTAS / BAJAS / MODIFICACIONES / ADICIONALES
  const opciones = ["ALTAS", "BAJAS", "MODIFICACIONES", "ADICIONALES"];
  const cuadroAltura = 15;
  const areaAltura = 30;

  const cuadroY = height - 90;
  const areaY = cuadroY - (areaAltura - cuadroAltura);
  const cuadroAnchoIndividual = 90;
  const totalAncho = opciones.length * cuadroAnchoIndividual;
  const startX = (width - totalAncho) / 2;

  // Cuadro unificado
  page.drawRectangle({
    x: startX,
    y: cuadroY,
    width: totalAncho,
    height: cuadroAltura,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.3,
  });

  // Líneas internas y textos
  let offsetX = startX;
  opciones.forEach((texto, index) => {
    if (index !== 0) {
      const x = offsetX;
      page.drawLine({
        start: { x, y: cuadroY },
        end: { x, y: cuadroY + cuadroAltura },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }

    const textWidth = font.widthOfTextAtSize(texto, fontSize);
    page.drawText(texto, {
      x: offsetX + (cuadroAnchoIndividual - textWidth) / 2,
      y: cuadroY + 4,
      size: fontSize,
      font,
    });

    offsetX += cuadroAnchoIndividual;
  });

  // Recuadro ÁREA
  const areaX = startX + totalAncho + 50;
  const areaAncho = 150;

  page.drawRectangle({
    x: areaX,
    y: areaY,
    width: areaAncho,
    height: areaAltura,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.3,
  });

  // Texto "ÁREA:"
  const areaLabel = "ÁREA:";
  page.drawText(areaLabel, {
    x: areaX + 5,
    y: areaY + 4,
    size: fontSize,
    font,
  });

  // Texto aclaratorio
  const aclaracion = "(Tachar lo que no corresponda).";
  const aclaracionWidth = font.widthOfTextAtSize(aclaracion, fontSize);
  page.drawText(aclaracion, {
    x: (width - aclaracionWidth) / 2,
    y: cuadroY - 12,
    size: fontSize,
    font,
  });

  // NUEVO RECUADRO CON LA ESTRUCTURA ESPECÍFICA
  const infoBoxY = cuadroY - 50;
  const infoBoxHeight = 30;
  const infoBoxWidth = width - 90;

  // Recuadro principal
  page.drawRectangle({
    x: 50,
    y: infoBoxY - infoBoxHeight,
    width: infoBoxWidth,
    height: infoBoxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.3,
  });

  // MES/AÑO (sobre el borde superior)
  page.drawText("MES / AÑO", {
    x: 550,
    y: infoBoxY + 2,
    size: fontSize,
    font,
  });

  // PARTE SUPERIOR (Distrito y Región)
  page.drawText("Distrito:", {
    x: 60,
    y: infoBoxY - 10,
    size: fontSize,
    font,
  });

  page.drawText("General Pueyrredon N°043", {
    x: 150,
    y: infoBoxY - 10,
    size: fontSize,
    font,
  });

  // Recuadro "REGION N°19"
  const regionBoxWidth = 90;
  const regionBoxX = 330;
  page.drawRectangle({
    x: regionBoxX,
    y: infoBoxY - 15,
    width: regionBoxWidth,
    height: 15,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.3,
  });

  page.drawText("REGION N° 19", {
    x: regionBoxX + 20,
    y: infoBoxY - 10,
    size: fontSize,
    font,
  });

  // PARTE INFERIOR (Establecimiento, DIEGEP, Porcentaje)
  page.drawText("Establecimiento:", {
    x: 85,
    y: infoBoxY - 25,
    size: fontSize,
    font,
  });

  page.drawText("DIEGEP", {
    x: 480,
    y: infoBoxY - 25,
    size: fontSize,
    font,
  });

  page.drawText("Porcentaje: 100%", {
    x: 620,
    y: infoBoxY - 25,
    size: fontSize,
    font,
  });

  const drawWrappedText = (
    text,
    x,
    y,
    maxWidth,
    fontSize,
    font,
    lineHeight = 10,
    boxHeight,
    columnWidth
  ) => {
    const words = text.split("");
    let lines = [];
    let currentLine = words[0];
    // Dividir el texto en líneas
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + "" + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    // Calcular posición Y para centrado vertical
    const totalTextHeight = lines.length * lineHeight;
    const startY = y - (boxHeight - totalTextHeight) / 2 + lineHeight;
    // Dibujar cada línea centrada
    lines.forEach((line, index) => {
      const lineWidth = font.widthOfTextAtSize(line, fontSize);
      const centeredX = x + (columnWidth - lineWidth) / 2;
      page.drawText(line, {
        x: centeredX,
        y: startY - index * lineHeight,
        size: fontSize,
        font,
      });
    });
  };

  const columnBoxY = infoBoxY - infoBoxHeight - 5;
  const columnBoxHeight = 40; // Aumentamos la altura para mejor centrado
  const columnWidths = [140, 124, 140, 175, 175];
  const columnBoxWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  // Dibujar el recuadro principal
  page.drawRectangle({
    x: 50,
    y: columnBoxY - columnBoxHeight,
    width: columnBoxWidth,
    height: columnBoxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.3,
  });

  // Dibujar líneas divisorias entre columnas
  let currentX = 50;
  for (let i = 0; i < columnWidths.length - 1; i++) {
    currentX += columnWidths[i];
    page.drawLine({
      start: { x: currentX, y: columnBoxY - columnBoxHeight },
      end: { x: currentX, y: columnBoxY },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
  }

  const columnTitles = [
    "Bajas y Modificaciones",
    "Altas, Bajas, Modificaciones y Adicionales",
    "Altas y Adicionales",
    "Altas, Modificaciones y Adicionales",
    "Altas, Bajas, Modificaciones y Adicionales",
  ];

  const columnFontSize = 8; // Reducimos un poco el tamaño para mejor ajuste
  const lineHeight = 9; // Espaciado entre líneas

  // Dibujar texto en cada columna
  currentX = 50;
  for (let i = 0; i < columnWidths.length; i++) {
    const padding = 5; // Reducimos el padding para aprovechar más espacio
    const maxWidth = columnWidths[i] - padding * 2;

    drawWrappedText(
      columnTitles[i],
      currentX,
      columnBoxY - 5,
      maxWidth,
      columnFontSize,
      font,
      lineHeight,
      columnBoxHeight,
      columnWidths[i] // Pasamos el ancho total de la columna para centrado
    );

    currentX += columnWidths[i];
  }

  /*ROW DE LA TABLA*/
  const rowBoxHeight = 40;
  const rowBoxY = columnBoxY - columnBoxHeight;
  page.drawRectangle({
    x: 50,
    y: rowBoxY - rowBoxHeight,
    width: columnBoxWidth,
    height: rowBoxHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.3,
  });
  currentX = 50;
  for (let i = 0; i < columnWidths.length - 1; i++) {
    currentX += columnWidths[i];
    page.drawLine({
      start: { x: currentX, y: rowBoxY - rowBoxHeight },
      end: { x: currentX, y: rowBoxY },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
  }
  const secondRowBoxHeight = 15;
  const secondRowBoxY = rowBoxY - rowBoxHeight;
  page.drawLine({
    start: { x: 50, y: secondRowBoxY - secondRowBoxHeight },
    end: { x: 50 + columnBoxWidth, y: secondRowBoxY - secondRowBoxHeight },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });

  // Línea izquierda del recuadro
  page.drawLine({
    start: { x: 50, y: secondRowBoxY },
    end: { x: 50, y: secondRowBoxY - secondRowBoxHeight },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });

  // Línea derecha del recuadro
  page.drawLine({
    start: { x: 50 + columnBoxWidth, y: secondRowBoxY },
    end: { x: 50 + columnBoxWidth, y: secondRowBoxY - secondRowBoxHeight },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });
  currentX = 50;
  for (let i = 0; i < columnWidths.length - 1; i++) {
    currentX += columnWidths[i];
    page.drawLine({
      start: { x: currentX, y: secondRowBoxY },
      end: { x: currentX, y: secondRowBoxY - secondRowBoxHeight },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
  }
  const numExtraRows = 4;
  const rowHeight = 50;

  // Empezamos desde la segunda fila, bajamos fila por fila
  for (let i = 1; i <= numExtraRows; i++) {
    const y = secondRowBoxY - rowHeight * i + 35;
    // Línea inferior de la fila (para que quede como borde entre filas)
    page.drawLine({
      start: { x: 50, y: y - rowHeight },
      end: { x: 50 + columnBoxWidth, y: y - rowHeight },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });

    // Líneas laterales izquierda y derecha
    page.drawLine({
      start: { x: 50, y: y },
      end: { x: 50, y: y - rowHeight },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: 50 + columnBoxWidth, y: y },
      end: { x: 50 + columnBoxWidth, y: y - rowHeight },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });

    // Divisiones internas verticales
    let currentX = 50;
    for (let j = 0; j < columnWidths.length - 1; j++) {
      currentX += columnWidths[j];
      page.drawLine({
        start: { x: currentX, y: y },
        end: { x: currentX, y: y - rowHeight },
        thickness: 0.3,
        color: rgb(0, 0, 0),
      });
    }
  }
  const texto = "ANEXO II (a)";
  const textWidth = font.widthOfTextAtSize(texto, fontSize);

  // Medidas de la página
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  // 1. Posicionar X lo más a la derecha posible, restando un pequeño margen
  const margin = 25;
  const x = pageWidth - margin;

  // 2. Centrar en Y (usamos el centro de la tabla si querés mantenerlo centrado ahí)
  const totalRows = numExtraRows + 1;
  const tableHeight = totalRows * rowHeight;
  const centerY = secondRowBoxY - tableHeight / 2;
  const y = pageHeight / 2 - textWidth / 2 + 25; // importante: porque el texto se dibuja rotado

  // Dibujar el texto horizontalmente
  page.drawText(texto, {
    x,
    y,
    size: fontSize,
    font,
    rotate: degrees(-90),
  });
  // Firmas
  page.drawText("Director/a", { x: 60, y: 60, size: fontSize, font });
  page.drawText("Representante Legal", { x: 240, y: 60, size: fontSize, font });
  page.drawText("Inspector/a", { x: 420, y: 60, size: fontSize, font });
  page.drawText("Director/a Administrativo/a", { x: 600, y: 60, size: fontSize, font });
  // Lugar y fecha
  const fontSizeLugar = 6;
  page.drawText("Lugar y fecha: Mar del Plata", {
    x: 50,
    y: 115,
    size: fontSizeLugar,
    font,
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

export default { generar };
