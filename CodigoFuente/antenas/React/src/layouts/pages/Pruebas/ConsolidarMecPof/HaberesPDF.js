import jsPDF from "jspdf";
import "jspdf-autotable";

const HaberesPDF = async (reporteData) => {
  const { establecimiento, docentes, totales, totalesFinales } = reporteData;
  console.log("TotalesConceptos: ", totalesFinales);
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(8);

  // ================================================
  // AUXILIAR PARA LINEA SEPARADORA DE CADA DOCENTE
  // ================================================
  const drawSeparationLine = (y) => {
    const inicioX = 92;
    const anchoPagina = doc.internal.pageSize.getWidth();
    const largo = anchoPagina - inicioX - 14;
    let linea = "";
    while (doc.getTextWidth(linea + "*") < largo) linea += "*";
    doc.text(linea, inicioX, y);
  };

  // ================================================
  // ENCABEZADO BASE (SE USA EN TODAS LAS PÁGINAS)
  // ================================================
  const drawHeaderBase = (isLastPage = false) => {
    doc.text("PROVINCIA DE BUENOS AIRES - SERVICIOS DPTI -", 14, 15);

    const getMonthName = (monthNumber) => {
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return months[parseInt(monthNumber, 10) - 1] || "";
    };

    doc.text("DIRECCION GENERAL DE CULTURA Y EDUCACION", 14, 19);
    doc.text("DIRECCION DE EDUCACION DE GESTION PRIVADA", 14, 23);

    const liquidacionText = `${getMonthName(establecimiento.mesLiquidacion)} de ${
      establecimiento.anioLiquidacion
    }`;
    doc.text(liquidacionText.toUpperCase(), 230, 27);

    if (isLastPage) {
      // Aquí puedes poner el texto que quieres que aparezca solo en la última página
      doc.text("- P L A N I L L A  D E  S U B V E N C I O N  D E L  E S T A D O -", 17, 30);
    } else {
      doc.text("- P L A N I L L A  D E  H A B E R E S -", 17, 30);
      doc.text("Di.E.Ge.P", 100, 30);
    }

    doc.text(
      `N/R PESOS ${String(establecimiento.ordenPago).slice(-4)}  Sueldos Conv ME 421/09 Cajero`,
      180,
      34
    );

    doc.text("DISTRITO :043  G Pueyrredon", 14, 37);
    doc.text(`TIPO ORG :${establecimiento.tipoEst} ${establecimiento.tipoEstDesc}`, 90, 37);
    doc.text(`INSTITUTO: ${establecimiento.nroDiegep} ${establecimiento.nombrePcia}`, 180, 37);

    doc.text(`RURAL: ${establecimiento.ruralidad}`, 65, 41);
    doc.text(`SECCS: ${establecimiento.cantSecciones}`, 110, 41);
    doc.text(`TURNOS: ${establecimiento.cantTurnos}`, 160, 41);
    doc.text(`SUBVENCION: ${establecimiento.subvencion} %`, 220, 41);
  };

  // =====================================================
  // ENCABEZADO DE TABLA ASCII (NO SE USA EN ÚLTIMA PÁGINA)
  // =====================================================
  const drawHeaderTabla = () => {
    const margenX = 14;
    const anchoPag = doc.internal.pageSize.getWidth();
    const anchoDisponible = anchoPag - margenX * 2;

    const inicio = "#";
    const patron = " -";
    const fin = " #";
    const extra = doc.getTextWidth("-");

    let linea = inicio;
    while (doc.getTextWidth(linea + patron + fin) < anchoDisponible + extra) linea += patron;
    linea += fin;
    doc.text(linea, margenX, 46);

    const y1 = 50,
      y2 = 53,
      y3 = 56;

    const enc1 =
      "*            *        DATOS       *R F*                      *              *     DESCUENTOS    *            *Nro. Cheque  Y  *  Nro. *";
    const enc2 =
      "* DOCUMENTO/ *                    *E U*      CONCEPTOS       *   IMPORTES   * - - - - + - - - - *    NETO    *                *RECIBO *";
    const enc3 =
      "*   CARGO    *     PERSONALES     *V N*    REMUNERACIONES    *              * INASIST + JUBILAC *            *RECIBI CONFORME *DE PAGO*";

    const calcSpace = (txt) => (anchoDisponible - doc.getTextWidth(txt)) / (txt.length - 1);

    doc.text(enc1, margenX, y1, { charSpace: calcSpace(enc1) });
    doc.text(enc2, margenX, y2, { charSpace: calcSpace(enc2) });
    doc.text(enc3, margenX, y3, { charSpace: calcSpace(enc3) });

    let linea2 = inicio;
    while (doc.getTextWidth(linea2 + patron + fin) < anchoDisponible + extra) linea2 += patron;
    linea2 += fin;
    doc.text(linea2, margenX, y3 + 4);
  };

  // ================================================
  // PIE DE PÁGINA
  // ================================================
  const addFooters = () => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${totalPages}`, 98, doc.internal.pageSize.height - 10);
    }
  };

  // ==================================================
  // PRIMERA PÁGINA: BASE + TABLA
  // ==================================================
  const drawHeader = () => {
    drawHeaderBase();
    drawHeaderTabla();
  };

  drawHeader();

  const startY = 65;
  const endY = doc.internal.pageSize.height - 15;
  let posY = startY;

  // ================================================
  // LOOP DE DOCENTES
  // ================================================
  docentes.forEach((d) => {
    const cant = d.codigosLiquidacionDetallados.length;
    const altura = 10 + cant * 4 + 6;

    if (posY + altura > endY) {
      doc.addPage();
      drawHeader();
      posY = startY;
    }

    doc.text(`${d.dni}/${d.secuencia}`, 16, posY);
    doc.text(`AFEC:${d.anioMesAfectacion}`, 16, posY + 3);
    doc.text(`CATEG. ${d.categoria}`, 41, posY + 3);

    if (Number(d.cantHsCs) !== 0) {
      doc.text(`HS.CS ${Number(d.cantHsCs).toFixed(2)}`, 55, posY + 3);
    }

    doc.text(
      `ANT:${String(d.anioAntiguedad).padStart(2, "0")}/${String(d.mesAntiguedad).padStart(
        2,
        "0"
      )}`,
      16,
      posY + 6
    );
    doc.text(`${d.apellido} ${d.nombre}`, 41, posY);
    doc.text(`${d.carRevista} ${d.tipoFuncion}`, 84, posY);

    if (d.sinHaberes === "S") {
      doc.text("<--- SIN HABERES --->", 92, posY + 3);
      const y = posY + 10;
      drawSeparationLine(y);
      posY = y + 4;
      return;
    }

    if (d.sinSubvencion === "S") {
      doc.text("<--- SIN SUBVENCION --->", 92, posY + 3);
      const y = posY + 10;
      drawSeparationLine(y);
      posY = y + 4;
      return;
    }

    doc.text(`NETO : ${d.neto}`, 205, posY);

    let yConcepto = posY;

    d.codigosLiquidacionDetallados.forEach((c) => {
      if (c.descripcion.toUpperCase().includes("PATRONAL")) return;

      const codigoForm = c.codigo.slice(0, -1) + "." + c.codigo.slice(-1);
      doc.text(`${codigoForm} ${c.descripcion}`, 92, yConcepto);

      const num = Number(c.importe);
      const text = `${c.signo === "-" ? "-" : ""}${num.toFixed(2)}`;
      const desc = c.descripcion.trim().toUpperCase();

      let x = 160;
      if (desc === "IPS") x += 35;

      doc.text(text, x - doc.getTextWidth(text), yConcepto);

      yConcepto += 4;
    });

    const yLinea = Math.max(posY + 10, yConcepto + 2);
    drawSeparationLine(yLinea);
    posY = yLinea + 4;
  });

  // ================================================
  // TOTALES
  // ================================================
  doc.text(`TOTAL DEL DISTRITO 043 INSTITUTO ${establecimiento.nroDiegep}`, 14, posY);
  doc.text(`DOCENTES: `, 92, posY);
  doc.text(`${totales.totalPersonas}`, 150, posY);
  posY += 3;

  doc.text(`C/APORTES:`, 92, posY);
  doc.text(`${totales.totalConAporte.toFixed(2)}`, 150, posY);
  posY += 3;

  doc.text(`S/APORTES - No Salario:`, 92, posY);
  doc.text(`${totales.totalSinAporte.toFixed(2)}`, 150, posY);
  posY += 3;

  doc.text(`SALARIO FAMILIAR:`, 92, posY);
  doc.text(`${totales.totalSalario.toFixed(2)}`, 150, posY);
  posY += 3;

  doc.text(`DESCUENTOS:`, 92, posY);
  doc.text(`${totales.totalIps.toFixed(2)}`, 150, posY);
  posY += 3;

  // ================================================
  // ÚLTIMA PÁGINA: SOLO ENCABEZADO BASE
  // ================================================
  doc.addPage();
  drawHeaderBase(true); // Se pasa 'true' para indicar que es la última página
  const drawLineaConceptosFinales = (y) => {
    const margenX = 14;
    const anchoPagina = doc.internal.pageSize.getWidth();
    const anchoDisponible = anchoPagina - margenX * 2;

    const inicio = "#";
    const patron = " -";
    const fin = " #";
    const anchoExtra = doc.getTextWidth("-");

    let linea = inicio;
    while (doc.getTextWidth(linea + patron + fin) < anchoDisponible + anchoExtra) {
      linea += patron;
    }
    linea += fin;

    doc.text(linea, margenX, y);
  };
  drawLineaConceptosFinales(45);
  const drawLineMatchingText = (text, x, y) => {
    const targetWidth = doc.getTextWidth(text);
    const pattern = " -";
    let line = "-";
    // Expandir la línea hasta igualar o superar el ancho del texto
    while (doc.getTextWidth(line) < targetWidth) {
      line += pattern;
    }

    doc.text(line, x, y);
  };
  const titulo = "C O N T R I B U C I O N  D E L  E S T A D O";

  // Dibujar la línea exactamente debajo del texto
  drawLineMatchingText(titulo, 30, 53);

  // Texto original
  doc.text(titulo, 30, 49);
  doc.text("CONCEPTOS", 31, 57);
  doc.text("DESCRIPCIONES", 55, 57);
  doc.text("IMPORTES", 95, 57);
  doc.text("D E V O L U C I O N E S", 215, 49);
  doc.text("IMPORTES", 225, 57);
  doc.text("BAJAS", 215, 61);
  doc.text("INASISTENCIAS", 235, 61);
  // Línea de guiones tipo "- - - -"
  // ------------------------------------------------------
  // DIBUJO DE LÍNEAS
  // ------------------------------------------------------

  const drawLineaSimple = (y) => {
    const margenX = 14;
    const anchoPagina = doc.internal.pageSize.getWidth();
    const anchoDisponible = anchoPagina - margenX * 2;

    const patron = " -";
    const anchoExtra = doc.getTextWidth("-");

    let linea = "-";

    while (doc.getTextWidth(linea + patron) < anchoDisponible + anchoExtra) {
      linea += patron;
    }

    doc.text(linea, margenX, y);
  };

  // Línea vertical izquierda y derecha
  const drawLateral = (y) => {
    doc.text("|", 13, y);
    doc.text("|", 283, y);
    doc.text("|", 97, y);
  };

  // laterales continuos (clave)
  const drawLateralesContinuos = (yInicio, yFin) => {
    let y = yInicio;
    while (y <= yFin) {
      drawLateral(y);
      y += 3;
    }
  };

  // Fila con laterales y contenido
  const drawRow = (y, drawContent) => {
    drawContent();
    return y + 3;
  };

  // Fila vacía CON laterales
  const drawBlankRow = (y) => {
    return y + 3;
  };

  // ------------------------------------------------------
  // AGRUPAMIENTO DE ÍTEMS
  // ------------------------------------------------------

  const grupo1 = totalesFinales.filter((x) => x.conAporte === "S" && x.patronal === "N");

  const normalize = (s) => (s || "").toUpperCase();

  const grupo2 = totalesFinales.filter((x) => {
    if (x.conAporte !== "N") return false;
    const desc = normalize(x.descripcion);
    return !desc.includes("IPS") && !desc.includes("OBRA SOCIAL");
  });

  const grupo3 = totalesFinales.filter((x) => {
    if (x.conAporte !== "N") return false;
    const desc = normalize(x.descripcion);
    return desc.includes("IPS") || desc.includes("OBRA SOCIAL");
  });

  // ------------------------------------------------------
  // IMPRESIÓN DE ÍTEMS
  // ------------------------------------------------------

  const drawTotalesFinales = (items, startY) => {
    let y = startY;

    items.forEach((item) => {
      y = drawRow(y, () => {
        const codigoStr = item.codigo?.toString() || "";
        let codigoFormateado = "";

        if (codigoStr.length > 1) {
          codigoFormateado = codigoStr.slice(0, -1) + "." + codigoStr.slice(-1);
        }

        doc.text(codigoFormateado, 31, y);
        doc.text(item.descripcion || "", 50, y);

        const importeStr = doc.formatNumber
          ? doc.formatNumber(item.importe)
          : item.importe?.toFixed(2)?.toString() || "";

        doc.text(importeStr, 120, y, { align: "right" });
      });
    });

    return y;
  };

  // ------------------------------------------------------
  // IMPRESIÓN FINAL DE BLOQUES
  // ------------------------------------------------------

  let y = 69;

  // Línea superior
  drawLineaSimple(65);

  // ------------------- GRUPO 1 -------------------
  y = drawTotalesFinales(grupo1, y);

  y = drawRow(y, () => {
    doc.text("TOTAL C/ APORTES. EN PESOS", 50, y);
    doc.text(`${totales.totalConAporte.toFixed(2)}`, 102, y);
  });

  // Espacio con laterales
  y = drawBlankRow(y);
  y = drawBlankRow(y);

  // ------------------- GRUPO 2 -------------------
  y = drawTotalesFinales(grupo2, y);

  y = drawRow(y, () => {
    doc.text("TOTAL S/ APORTES. EN PESOS", 50, y);
    doc.text(`${totales.totalSinAportesEnPesos.toFixed(2)}`, 102, y);
  });

  // Espacio con laterales
  y = drawBlankRow(y);
  y = drawBlankRow(y);

  // ------------------- GRUPO 3 -------------------
  y = drawTotalesFinales(grupo3, y);

  // Totales finales
  y = drawRow(y, () => {
    doc.text("TOTAL DESCUENTOS", 31, y);
    doc.text(`${totales.totalIps.toFixed(2)}`, 102, y);
  });

  y = drawRow(y, () => {
    doc.text("IMPORTE NETO EN PESOS", 31, y);
    doc.text(`${totales.importeNeto.toFixed(2)}`, 102, y);
  });

  y = drawRow(y, () => {
    doc.text("TOTAL RETEN. DENO 7", 31, y);
  });

  y = drawRow(y, () => {
    doc.text("IMPORTE RECIBIDO EN PESOS", 31, y);
  });

  // Línea inferior final
  const yLineaFinal = y + 3;
  drawLineaSimple(yLineaFinal);
  drawLateral(yLineaFinal - 2);
  doc.text("DEPOSITO DE I. P. S.", 31, yLineaFinal + 8);
  doc.text("PATRONAL 12%", 31, yLineaFinal + 12);
  doc.text(`${totales.totalIpsPatronal}`, 102, yLineaFinal + 12);
  doc.text("PERSONAL 16%", 31, yLineaFinal + 16);
  doc.text(`${totales.totalIps}`, 102, yLineaFinal + 16);
  doc.text("T O T A L  I. P. S.", 31, yLineaFinal + 20);
  doc.text(`${totales.totalIps}`, 102, yLineaFinal + 20);
  doc.text("OBRA SOCIAL", 31, yLineaFinal + 24);
  doc.text("PATRONAL 5%", 31, yLineaFinal + 28);
  doc.text(`${totales.osPatronal}`, 102, yLineaFinal + 28);
  doc.text("PERSONAL 3%", 31, yLineaFinal + 32);
  doc.text(`${totales.osPersonal}`, 102, yLineaFinal + 32);
  doc.text("T O T A L  O B R A  S O C I A L", 31, yLineaFinal + 36);
  doc.text(`${totales.totalOSGeneral}`, 102, yLineaFinal + 36);
  const yTotalObraSocial = yLineaFinal + 36;
  const yLineaCierre = yTotalObraSocial + 5;

  drawLineaSimple(yLineaCierre);
  drawLateralesContinuos(67, yLineaCierre);
  const drawLineaCentradaConTexto = (y, texto) => {
    const margenX = 14;
    const anchoPagina = doc.internal.pageSize.getWidth();
    const anchoDisponible = anchoPagina - margenX * 2;
    const anchoExtra = doc.getTextWidth("-");

    // 1. Generamos la línea base de guiones, igual que en drawLineaSimple
    const patron = " -";
    let lineaBase = "-";
    while (doc.getTextWidth(lineaBase + patron) < anchoDisponible + anchoExtra) {
      lineaBase += patron;
    }
    const textoFinal = texto.toUpperCase();
    const espacioEntreChevronYTexto = "   ";
    const parteCentral = espacioEntreChevronYTexto + textoFinal + espacioEntreChevronYTexto;
    const anchoParteCentral = doc.getTextWidth(parteCentral);
    const anchoTotalLinea = doc.getTextWidth(lineaBase);
    const anchoRellenoDisponible = anchoTotalLinea - anchoParteCentral;
    if (anchoRellenoDisponible <= 0) {
      doc.text(textoFinal, margenX + anchoTotalLinea / 2, y, { align: "center" });
      return;
    }
    const anchoParaCadaLado = anchoRellenoDisponible / 2;
    const anchoChevron = doc.getTextWidth("<");
    const cant = Math.floor(anchoParaCadaLado / anchoChevron);
    const izquierda = "<".repeat(cant);
    const derecha = ">".repeat(cant);
    const lineaFinal = izquierda + parteCentral + derecha;
    doc.text(lineaFinal, margenX + anchoTotalLinea / 2, y, { align: "center" });
  };
  drawLineaCentradaConTexto(yLineaCierre + 5, "P    E    S   O    S");
  drawLineaSimple(yLineaCierre + 10);

  addFooters();
  doc.output("dataurlnewwindow");
};

export default HaberesPDF;
