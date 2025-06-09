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
  //AGREGAR EL LOGO (NUEVO)
  const response = await fetch(logo);
  const imageBytes = await response.arrayBuffer();
  const image = await pdfDoc.embedPng(imageBytes);
  const logoWidth = image.width * 0.7;
  const logoHeight = image.height * 0.7;
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

  const DocumentoTitulo = "Documento de Identidad";
  page.drawText(DocumentoTitulo, {
    x: 65,
    y: infoBoxY - 105,
    size: fontSize,
    font,
  });

  const LeyendaTitulo = "Según anterior planilla de haberes.";
  page.drawText(LeyendaTitulo, {
    x: 57,
    y: infoBoxY - 83,
    size: fontSize,
    font,
  });

  const TituloSitRevista = "Sit. Revista";
  const fontSit = 7;
  page.drawText(TituloSitRevista, {
    x: regionBoxX + 3,
    y: infoBoxY - 113,
    size: fontSit,
    font,
    rotate: degrees(90),
  });

  const TituloRow2 = "Apelido y Nombres.";
  page.drawText(TituloRow2, {
    x: 215,
    y: infoBoxY - 98,
    size: fontSize,
    font,
  });

  page.drawText("DIEGEP", {
    x: 480,
    y: infoBoxY - 25,
    size: fontSize,
    font,
  });

  page.drawText("FUNCION", {
    x: 468,
    y: infoBoxY - 113,
    size: fontSize,
    font,
    rotate: degrees(90),
  });
  page.drawText("RURAL", {
    x: 490,
    y: infoBoxY - 108,
    size: fontSize,
    font,
    rotate: degrees(90),
  });
  page.drawText("TURNO", {
    x: 512,
    y: infoBoxY - 108,
    size: fontSize,
    font,
    rotate: degrees(90),
  });
  const fontCat = 6;
  page.drawText("CATEGORIA", {
    x: 533,
    y: infoBoxY - 112,
    size: fontCat,
    font,
    rotate: degrees(90),
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

  // Primera row
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

  // Líneas verticales entre columnas
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

  // 🔹 División horizontal en columna 1 (20% / 80%)
  const col1Width = columnWidths[0];
  const col1X = 50;
  const divisionY = rowBoxY - rowBoxHeight * 0.3;

  page.drawLine({
    start: { x: col1X, y: divisionY },
    end: { x: col1X + col1Width, y: divisionY },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });

  // 🔹 División vertical dentro del 80% (parte inferior de la celda)
  const verticalSplitX = col1X + col1Width * 0.85; // mitad de la columna
  page.drawLine({
    start: { x: verticalSplitX, y: rowBoxY - rowBoxHeight },
    end: { x: verticalSplitX, y: divisionY },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });
  const col3StartX = 50 + columnWidths.slice(0, 2).reduce((acc, val) => acc + val, 0); // Inicio de columna 3
  const col3Width = columnWidths[2];
  const divisionCol3X = col3StartX + col3Width * 0.2;

  page.drawLine({
    start: { x: divisionCol3X, y: rowBoxY },
    end: { x: divisionCol3X, y: rowBoxY - rowBoxHeight },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });

  //3 Row "finita con numeros"
  const secondRowBoxHeight = 15;
  const secondRowBoxY = rowBoxY - rowBoxHeight;
  page.drawLine({
    start: { x: 50, y: secondRowBoxY - secondRowBoxHeight },
    end: { x: 50 + columnBoxWidth, y: secondRowBoxY - secondRowBoxHeight },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 50, y: secondRowBoxY },
    end: { x: 50, y: secondRowBoxY - secondRowBoxHeight },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });
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
  // Divisiones internas en la columna 3 (Altas y Adicionales)
  const columna3InicioX = 50 + columnWidths.slice(0, 2).reduce((acc, val) => acc + val, 0);
  const columna3Ancho = columnWidths[2];

  // Proporciones: 40% (mediano), 20% (chico), 40% (resto)
  const proporciones = [0.2, 0.1, 0.7];
  const subdivisionesX = [
    columna3InicioX + columna3Ancho * proporciones[0],
    columna3InicioX + columna3Ancho * (proporciones[0] + proporciones[1]),
  ];

  for (let x of subdivisionesX) {
    page.drawLine({
      start: { x, y: secondRowBoxY },
      end: { x, y: secondRowBoxY - secondRowBoxHeight },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
  }
  // --- Aquí agregamos la división vertical para la columna 1 ---
  const columna1InicioX = 50;
  const columna1Ancho = columnWidths[0];
  const division75 = columna1InicioX + columna1Ancho * 0.85;

  page.drawLine({
    start: { x: division75, y: secondRowBoxY },
    end: { x: division75, y: secondRowBoxY - secondRowBoxHeight },
    thickness: 0.3,
    color: rgb(0, 0, 0),
  });
  //Rows 3,4,5,6
  const col4StartX = 50 + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0);
  const col4Width = columnWidths[3];
  const numSubdivisiones = 8;
  const subWidth = col4Width / numSubdivisiones;

  const row1TopY = rowBoxY;
  const row1BottomY = rowBoxY - rowBoxHeight;

  const row2TopY = secondRowBoxY;
  const row2BottomY = secondRowBoxY - secondRowBoxHeight;

  for (let i = 1; i < numSubdivisiones; i++) {
    const x = col4StartX + subWidth * i;

    // Subdivisiones fila 1 (recuadro principal)
    page.drawLine({
      start: { x, y: row1TopY },
      end: { x, y: row1BottomY },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });

    // Subdivisiones fila 2 (debajo del recuadro)
    page.drawLine({
      start: { x, y: row2TopY },
      end: { x, y: row2BottomY },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
  }
  const numExtraRows = 4;
  const rowHeight = 50;

  // Empezamos desde la segunda fila, bajamos fila por fila
  for (let i = 1; i <= numExtraRows; i++) {
    const y = secondRowBoxY - rowHeight * i + 35;
    const columna1InicioX = 50;
    const columna1Ancho = columnWidths[0];

    // División vertical en columna 1: 75% y 25%
    const division75 = columna1InicioX + columna1Ancho * 0.85;

    // Dibujo línea vertical para dividir la columna 1
    page.drawLine({
      start: { x: division75, y: y },
      end: { x: division75, y: y - rowHeight },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });

    // --- División horizontal en columna 2 ---
    const columna2InicioX = 50 + columnWidths[0]; // Inicio columna 2
    const columna2Ancho = columnWidths[1];
    const mitadRowHeight = rowHeight / 2;
    const yMitad = y - mitadRowHeight;

    page.drawLine({
      start: { x: columna2InicioX, y: yMitad },
      end: { x: columna2InicioX + columna2Ancho, y: yMitad },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });

    // --- División vertical columna 3 ---
    const columna3InicioX = 50 + columnWidths.slice(0, 2).reduce((acc, val) => acc + val, 0);
    const columna3Ancho = columnWidths[2]; // Ancho de columna 3

    const proporciones = [0.2, 0.1, 0.7];
    const subdivisionesX = [
      columna3InicioX + columna3Ancho * proporciones[0],
      columna3InicioX + columna3Ancho * (proporciones[0] + proporciones[1]),
    ];

    for (let x of subdivisionesX) {
      page.drawLine({
        start: { x, y: y },
        end: { x, y: y - rowHeight },
        thickness: 0.3,
        color: rgb(0, 0, 0),
      });
    }

    // --- División vertical columna 4 ---
    const columna4InicioX = 50 + columnWidths.slice(0, 3).reduce((acc, val) => acc + val, 0);
    const columna4Ancho = columnWidths[3]; // 175
    const subColumnas = 8;
    const subAncho = columna4Ancho / subColumnas;

    for (let k = 1; k < subColumnas; k++) {
      const xSub = columna4InicioX + subAncho * k;

      page.drawLine({
        start: { x: xSub, y: y },
        end: { x: xSub, y: y - rowHeight },
        thickness: 0.3,
        color: rgb(0, 0, 0),
      });
    }

    // Línea inferior de la fila (borde entre filas)
    page.drawLine({
      start: { x: 50, y: y - rowHeight },
      end: { x: 50 + columnBoxWidth, y: y - rowHeight },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });

    // Líneas laterales izquierda y derecha de la fila
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

    // Líneas verticales entre columnas
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
