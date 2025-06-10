import React from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import logo from "../../../../assets/images/Logo1.png";

const generar = async (movimiento) => {
  console.log("Datos Cableados: ", movimiento);
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 8;
  const fontSizeLugar = 6;

  // Cargar logo
  const response = await fetch(logo);
  const imageBytes = await response.arrayBuffer();
  const image = await pdfDoc.embedPng(imageBytes);
  const logoWidth = image.width * 0.7;
  const logoHeight = image.height * 0.7;

  const posicionesPorCampo = {
    nDNI: { x: 90, y: 0 },
    nombre: { x: 200, y: -18 },
    apellido: { x: 200, y: 5 },
    turno: { x: 499, y: 0 },
    categoria: { x: 520, y: 0 },
    nHoras: { x: 574, y: 0 },
    anos: { x: 593, y: 0 },
    meses: { x: 616, y: 0 },
    sitRevista: { x: 323, y: 0 },
    funcion: { x: 463, y: 0 },
    rural: { x: 483, y: 0 },
    observaciones: { x: 635, y: 17 },
  };

  const posicionesDocentes = [{ yBase: 300 }, { yBase: 250 }, { yBase: 200 }, { yBase: 150 }];

  const drawWrappedTextDocentes = (page, text, x, y, width, height, font, fontSize, lineHeight) => {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    for (let word of words) {
      const testLine = currentLine ? currentLine + " " + word : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth <= width) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    const maxLines = Math.floor(height / lineHeight);
    lines.slice(0, maxLines).forEach((line, i) => {
      page.drawText(line, {
        x,
        y: y - i * lineHeight,
        size: fontSize,
        font,
      });
    });
  };

  // Paginación: 4 docentes por página
  const docentesPorPagina = 4;
  const totalPaginas = Math.ceil(movimiento.docente.length / docentesPorPagina);

  for (let i = 0; i < totalPaginas; i++) {
    const page = pdfDoc.addPage([842, 595]); // A4 horizontal
    const { width, height } = page.getSize();

    // Logo
    page.drawImage(image, {
      x: width - logoWidth - 40,
      y: height - 50,
      width: logoWidth,
      height: logoHeight,
    });

    // Título
    const titulo = "PLANILLA DE MOVIMIENTO";
    page.drawText(titulo, {
      x: (width - fontBold.widthOfTextAtSize(titulo, 12)) / 2,
      y: height - 70,
      size: 12,
      font: fontBold,
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
    const areaLabel = `ÁREA: ${movimiento.area}`;
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
    page.drawText(`MES / AÑO:  ${movimiento.mes} ${movimiento.año} `, {
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
      fontBold,
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
      fontBold,
    });

    // PARTE INFERIOR (Establecimiento, DIEGEP, Porcentaje)
    page.drawText(`Establecimiento:  ${movimiento.establecimiento}`, {
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

    const lineHeightP = 8;
    const startXP = regionBoxX + 20;
    let startY = infoBoxY - 82;

    page.drawText("DOCUMENTO", {
      x: startXP,
      y: startY,
      size: fontSit,
      font,
    });

    const lines = ["1. Lib Enrolamiento", "2. Lib Civica", "3. Ced Identidad", "4. DNI"];

    lines.forEach((line, i) => {
      page.drawText(line, {
        x: startXP,
        y: startY - lineHeightP * (i + 1),
        size: fontSit,
        font,
      });
    });

    const TituloRow2 = "Apelido y Nombres.";
    page.drawText(TituloRow2, {
      x: 215,
      y: infoBoxY - 98,
      size: fontSize,
      font,
    });

    page.drawText(`DIEGEP    ${movimiento.diegep}`, {
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
      x: 488,
      y: infoBoxY - 108,
      size: fontSize,
      font,
      rotate: degrees(90),
    });
    page.drawText("TURNO", {
      x: 510,
      y: infoBoxY - 108,
      size: fontSize,
      font,
      rotate: degrees(90),
    });
    const fontCat = 6;
    page.drawText("CATEGORIA", {
      x: 528,
      y: infoBoxY - 112,
      size: fontCat,
      font,
      rotate: degrees(90),
    });
    page.drawText("IMPORTE", {
      x: 538.5,
      y: infoBoxY - 100,
      size: fontCat,
      font,
    });
    page.drawText("N° HORAS", {
      x: 580,
      y: infoBoxY - 113,
      size: fontSit,
      font,
      rotate: degrees(90),
    });
    page.drawText("AÑOS", {
      x: 600,
      y: infoBoxY - 105,
      size: fontSit,
      font,
      rotate: degrees(90),
    });
    page.drawText("MESES", {
      x: 622,
      y: infoBoxY - 107,
      size: fontSit,
      font,
      rotate: degrees(90),
    });
    page.drawText("OBSERVACIONES", {
      x: 680,
      y: infoBoxY - 97,
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
      const paragraphs = text.split("\n"); // separamos manualmente los saltos de línea
      let lines = [];

      paragraphs.forEach((paragraph) => {
        const words = paragraph.split(" ");
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + " " + word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine); // última línea del párrafo
      });

      const totalTextHeight = lines.length * lineHeight;
      const startY = y - (boxHeight - totalTextHeight) / 2 + lineHeight;
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
    const columnBoxHeight = 40;
    const columnWidths = [140, 124, 140, 175, 175];
    const columnBoxWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    page.drawRectangle({
      x: 50,
      y: columnBoxY - columnBoxHeight,
      width: columnBoxWidth,
      height: columnBoxHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.3,
    });

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
      "Bajas y\nModificaciones",
      "Altas, Bajas,\nModificaciones y\nAdicionales",
      "Altas y\nAdicionales",
      "Altas, Modificaciones\ny Adicionales",
      "Altas, Bajas, Modificaciones\ny Adicionales",
    ];

    const columnFontSize = 8.5;
    const lineHeight = 9;

    currentX = 50;
    for (let i = 0; i < columnWidths.length; i++) {
      const padding = 5;
      const maxWidth = columnWidths[i] - padding * 2;

      drawWrappedText(
        columnTitles[i],
        currentX,
        columnBoxY - 15,
        maxWidth,
        columnFontSize,
        fontBold,
        lineHeight,
        columnBoxHeight,
        columnWidths[i]
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
    const verticalSplitX = col1X + col1Width * 0.85;
    page.drawLine({
      start: { x: verticalSplitX, y: rowBoxY - rowBoxHeight },
      end: { x: verticalSplitX, y: divisionY },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
    const col3StartX = 50 + columnWidths.slice(0, 2).reduce((acc, val) => acc + val, 0);
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
    //Dibulo lineas de las 8  subdivioens
    const col4StartX = 50 + columnWidths.slice(0, 3).reduce((a, b) => a + b, 0);
    const col4Width = columnWidths[3];
    const numSubdivisiones = 8;

    const row1TopY = rowBoxY;
    const row1BottomY = rowBoxY - rowBoxHeight;

    const row2TopY = secondRowBoxY;
    const row2BottomY = secondRowBoxY - secondRowBoxHeight;

    const extraWidthForFifth = 10;
    const standardSubWidth = (col4Width - extraWidthForFifth) / numSubdivisiones;

    let currentXColumn = col4StartX;
    page.drawLine({
      start: { x: currentXColumn, y: row1TopY },
      end: { x: currentXColumn, y: row1BottomY },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: currentXColumn, y: row2TopY },
      end: { x: currentXColumn, y: row2BottomY },
      thickness: 0.3,
      color: rgb(0, 0, 0),
    });

    for (let i = 1; i <= numSubdivisiones; i++) {
      let subdivisionWidth = standardSubWidth;
      if (i === 5) {
        subdivisionWidth += extraWidthForFifth;
      }

      currentXColumn += subdivisionWidth;
      page.drawLine({
        start: { x: currentXColumn, y: row1TopY },
        end: { x: currentXColumn, y: row1BottomY },
        thickness: 0.3,
        color: rgb(0, 0, 0),
      });
      page.drawLine({
        start: { x: currentXColumn, y: row2TopY },
        end: { x: currentXColumn, y: row2BottomY },
        thickness: 0.3,
        color: rgb(0, 0, 0),
      });
    }
    //FIN
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
      const extraAnchoParaQuinta = 10;
      const anchoSubdivisionEstandar = (columna4Ancho - extraAnchoParaQuinta) / subColumnas;
      let currentXD = columna4InicioX;
      page.drawLine({
        start: { x: currentXD, y: y },
        end: { x: currentXD, y: y - rowHeight },
        thickness: 0.0,
        color: rgb(0, 0, 0),
      });
      for (let k = 1; k <= subColumnas; k++) {
        let anchoDeEstaSubdivision = anchoSubdivisionEstandar;
        if (k === 5) {
          anchoDeEstaSubdivision += extraAnchoParaQuinta;
        }
        currentXD += anchoDeEstaSubdivision;
        page.drawLine({
          start: { x: currentXD, y: y },
          end: { x: currentXD, y: y - rowHeight },
          thickness: 0.3,
          color: rgb(0, 0, 0),
        });
      }
      // Numerar subdivisiones de la segunda fila (14 divisiones específicas)
      let numero = 1;
      const rowY = row2BottomY;
      const ajusteVertical = 17;
      //const rowHeight = secondRowBoxHeight;

      // Columna 1 (2 divisiones: 85%, 15%)
      const col1X = 50;
      const col1W = columnWidths[0];
      const col1SubW = [col1W * 0.85, col1W * 0.15];

      [col1SubW[0], col1SubW[1]].forEach((w, i) => {
        const x = col1X + (i === 0 ? 0 : col1SubW[0]);
        const textWidth = font.widthOfTextAtSize(numero.toString(), fontSize);
        page.drawText(numero.toString(), {
          x: x + (w - textWidth) / 2,
          y: rowY + (rowHeight - fontSize) / 2 - ajusteVertical,
          size: fontSize,
          font,
        });
        numero++;
      });

      // Columna 2 (1 división)
      const col2X = col1X + col1W;
      const col2W = columnWidths[1];
      page.drawText(numero.toString(), {
        x: col2X + (col2W - font.widthOfTextAtSize(numero.toString(), fontSize)) / 2,
        y: rowY + (rowHeight - fontSize) / 2 - ajusteVertical,
        size: fontSize,
        font,
      });
      numero++;

      // Columna 3 (3 divisiones: 20%, 10%, 70%) – sólo numeramos las primeras 2
      const col3X = col2X + col2W;
      const col3W = columnWidths[2];
      const col3SubW = [col3W * 0.2, col3W * 0.1];

      col3SubW.forEach((w, i) => {
        const offset = col3SubW.slice(0, i).reduce((acc, val) => acc + val, 0);
        const x = col3X + offset;
        const textWidth = font.widthOfTextAtSize(numero.toString(), fontSize);
        page.drawText(numero.toString(), {
          x: x + (w - textWidth) / 2,
          y: rowY + (rowHeight - fontSize) / 2 - ajusteVertical,
          size: fontSize,
          font,
        });
        numero++;
      });

      // Columna 4 (8 divisiones iguales)
      const col4X = col3X + col3W;
      const col4W = columnWidths[3];
      const numSubdivisiones = 8;
      const extraAnchoParaQuintaP = 10;
      const anchoSubdivisionEstandarP = (col4W - extraAnchoParaQuintaP) / numSubdivisiones;
      let currentXParaSubdivisiones = col4X;
      for (let i = 1; i <= numSubdivisiones; i++) {
        let anchoDeEstaSubdivision = anchoSubdivisionEstandarP;
        if (i === 5) {
          anchoDeEstaSubdivision += extraAnchoParaQuintaP;
        }
        const textWidth = font.widthOfTextAtSize(numero.toString(), fontSize);
        const xTextoCentrado = currentXParaSubdivisiones + (anchoDeEstaSubdivision - textWidth) / 2;

        page.drawText(numero.toString(), {
          x: xTextoCentrado,
          y: rowY + (rowHeight - fontSize) / 2 - ajusteVertical,
          size: fontSize,
          font,
        });

        numero++;
        currentXParaSubdivisiones += anchoDeEstaSubdivision;
      }
      const col5X = col4X + col4W;
      const col5W = columnWidths[4];

      const textWidthCol5 = font.widthOfTextAtSize(numero.toString(), fontSize);
      page.drawText(numero.toString(), {
        x: col5X + (col5W - textWidthCol5) / 2,
        y: rowY + (rowHeight - fontSize) / 2 - ajusteVertical,
        size: fontSize,
        font,
      });
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
    const margin = 25;
    const x = pageWidth - margin;
    const totalRows = numExtraRows + 1;
    const tableHeight = totalRows * rowHeight;
    const centerY = secondRowBoxY - tableHeight / 2;
    const y = pageHeight / 2 - textWidth / 2 + 25;
    page.drawText(texto, {
      x,
      y,
      size: fontSize,
      font,
      rotate: degrees(-90),
    });

    //Seccion Docentes Imprimo en la Hoja
    const docentesPagina = movimiento.docente.slice(
      i * docentesPorPagina,
      i * docentesPorPagina + docentesPorPagina
    );

    docentesPagina.forEach((docente, index) => {
      const yBase = posicionesDocentes[index].yBase;

      Object.entries(posicionesPorCampo).forEach(([campo, pos]) => {
        const texto = docente[campo] !== undefined ? String(docente[campo]) : "";

        if (campo === "observaciones") {
          drawWrappedTextDocentes(
            page,
            texto,
            pos.x,
            yBase + pos.y,
            175,
            50,
            font,
            fontSize,
            fontSize + 2
          );
        } else {
          page.drawText(texto, {
            x: pos.x,
            y: yBase + pos.y,
            size: fontSize,
            font,
          });
        }
      });
    });
    // Firmas
    page.drawText("Director/a", { x: 60, y: 60, size: fontSize, font });
    page.drawText("Representante Legal", { x: 240, y: 60, size: fontSize, font });
    page.drawText("Inspector/a", { x: 420, y: 60, size: fontSize, font });
    page.drawText("Director/a Administrativo/a", { x: 600, y: 60, size: fontSize, font });

    // Lugar y fecha
    page.drawText("Lugar y fecha: Mar del Plata", {
      x: 50,
      y: 115,
      size: fontSizeLugar,
      font,
    });
  }

  // Guardar y abrir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

export default { generar };
