import jsPDF from "jspdf";
import "jspdf-autotable";

// ---------------------------------------------
// FUNCIONES AUXILIARES PARA TABLAS ASCII
// ---------------------------------------------
const repeat = (char, count) => Array(count + 1).join(char);

const HaberesPDF = async (reporteData) => {
  const { establecimiento, docentes } = reporteData;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("courier", "normal");
  doc.setFontSize(8);

  // ================================
  // FUNCION PARA LÍNEA DE SEPARACIÓN
  // ================================
  const drawSeparationLine = (y) => {
    const inicioX = 92;
    const anchoPagina = doc.internal.pageSize.getWidth();
    const largo = anchoPagina - inicioX - 14;
    let linea = "";

    while (doc.getTextWidth(linea + "*") < largo) {
      linea += "*";
    }

    doc.text(linea, inicioX, y);
  };

  // ================================
  // FUNCION PARA DIBUJAR ENCABEZADO
  // ================================
  const drawHeader = () => {
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
      const index = parseInt(monthNumber, 10) - 1;
      return months[index] || "";
    };

    doc.text("DIRECCION GENERAL DE CULTURA Y EDUCACION", 14, 19);
    doc.text("DIRECCION DE EDUCACION DE GESTION PRIVADA", 14, 23);
    const liquidacionText = `${getMonthName(establecimiento.mesLiquidacion)} de ${
      establecimiento.anioLiquidacion
    }`;
    doc.text(liquidacionText.toUpperCase(), 230, 27);
    doc.text("- P L A N I L L A  D E  H A B E R E S -", 17, 30);

    doc.text("Di.E.Ge.P", 100, 30);
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

    // Línea divisoria
    const margenX = 14;
    const anchoPagina2 = doc.internal.pageSize.getWidth();
    const anchoDisponible = anchoPagina2 - margenX * 2;

    const inicio = "#";
    const patron = " -";
    const fin = " #";
    const anchoExtra = doc.getTextWidth("-");

    let linea = inicio;
    while (doc.getTextWidth(linea + patron + fin) < anchoDisponible + anchoExtra) {
      linea += patron;
    }
    linea += fin;

    doc.text(linea, margenX, 46);

    // Encabezado columnas
    const posY_Enc1 = 50;
    const posY_Enc2 = posY_Enc1 + 3;
    const posY_Enc3 = posY_Enc2 + 3;

    const enc1 =
      "*            *        DATOS       *R F*                      *              *     DESCUENTOS    *            *Nro. Cheque  Y  *  Nro. *";
    const enc2 =
      "* DOCUMENTO/ *                    *E U*      CONCEPTOS       *   IMPORTES   * - - - - + - - - - *    NETO    *                *RECIBO *";
    const enc3 =
      "*   CARGO    *     PERSONALES     *V N*    REMUNERACIONES    *              * INASIST + JUBILAC *            *RECIBI CONFORME *DE PAGO*";

    const anchoDisponible2 = anchoDisponible;
    const calcCharSpace = (texto) =>
      (anchoDisponible2 - doc.getTextWidth(texto)) / (texto.length - 1);

    doc.text(enc1, margenX, posY_Enc1, { charSpace: calcCharSpace(enc1) });
    doc.text(enc2, margenX, posY_Enc2, { charSpace: calcCharSpace(enc2) });
    doc.text(enc3, margenX, posY_Enc3, { charSpace: calcCharSpace(enc3) });

    // Línea debajo encabezado
    let linea2 = inicio;
    while (doc.getTextWidth(linea2 + patron + fin) < anchoDisponible + anchoExtra) {
      linea2 += patron;
    }
    linea2 += fin;

    doc.text(linea2, margenX, posY_Enc3 + 4);
  };

  // ================================
  // PIE DE PÁGINA
  // ================================
  const addFooters = () => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, 14, doc.internal.pageSize.height - 10);
    }
  };

  // ================================
  // INICIO PRIMERA PÁGINA
  // ================================
  drawHeader();

  const startContentY = 65;
  const endContentY = doc.internal.pageSize.height - 15;
  let posY = startContentY;

  // ===== ACUMULADORES GLOBALES =====
  let totalDocentes = docentes.length;
  let totalCAportes = 0;
  let totalSAportes = 0;
  let totalSalarioFamiliar = 0;
  let totalDescuentos = 0;

  docentes.forEach((d) => {
    const cantidadConceptos = d.codigosLiquidacionDetallados.length;
    const alturaConceptos = cantidadConceptos * 4;
    const alturaDocente = 10 + alturaConceptos + 6;

    if (posY + alturaDocente > endContentY) {
      doc.addPage();
      drawHeader();
      posY = startContentY;
    }

    // DATOS PRINCIPALES
    doc.text(`${d.dni}/${d.secuencia}`, 16, posY);
    doc.text(`AFEC:${d.anioMesAfectacion}`, 16, posY + 3);
    doc.text(`CATEG. ${d.categoria}`, 41, posY + 3);
    if (Number(d.cantHsCs) !== 0) {
      const hsFormateado = Number(d.cantHsCs).toFixed(2);
      doc.text(`HS.CS      ${hsFormateado}`, 55, posY + 3);
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

    // SI ES "SIN HABERES" → SOLO IMPRIME MENSAJE Y LÍNEA
    if (d.sinHaberes === "S") {
      doc.setFontSize(8);
      doc.text("<--- SIN HABERES --->", 92, posY + 3);

      // Línea de separación
      const lineaY = posY + 10;
      drawSeparationLine(lineaY);

      posY = lineaY + 4;
      return; // NO imprime conceptos ni neto
    }
    if (d.sinSubvencion === "S") {
      doc.setFontSize(8);
      doc.text("<--- SIN SUBVENCION --->", 92, posY + 3);

      const lineaY = posY + 10;
      drawSeparationLine(lineaY);

      posY = lineaY + 4;
      return;
    }

    // ----------- SI *NO* ES SIN HABERES CONTINÚA NORMAL -----------

    doc.text(`NETO : ${d.neto}`, 205, posY);

    // DETALLE DE CONCEPTOS
    let detalleY = posY;

    d.codigosLiquidacionDetallados.forEach((c) => {
      if (c.descripcion.toUpperCase().includes("PATRONAL")) return;

      const codigoFormateado = c.codigo.slice(0, -1) + "." + c.codigo.slice(-1);
      const linea = `${codigoFormateado} ${c.descripcion}`;
      doc.text(linea, 92, detalleY);

      const importeNum = Number(c.importe);
      const importeTexto = `${c.signo === "-" ? "-" : ""}${importeNum.toFixed(2)}`;
      const descUpper = c.descripcion.trim().toUpperCase();

      // SUMA DE TOTALES
      if (descUpper.includes("C/APORT")) totalCAportes += importeNum;
      if (descUpper.includes("S/APORT") || descUpper.includes("NO SALARIO"))
        totalSAportes += importeNum;
      if (descUpper.includes("SALARIO FAMILIAR")) totalSalarioFamiliar += importeNum;
      if (c.signo === "-") totalDescuentos += importeNum;

      const xRightBase = 160;
      const esIPS = descUpper === "IPS";
      const extraOffset = esIPS ? 35 : 0;
      const xRight = xRightBase + extraOffset;

      const textWidth = doc.getTextWidth(importeTexto);
      doc.text(importeTexto, xRight - textWidth, detalleY);

      detalleY += 4;
    });

    // LÍNEA DE SEPARACIÓN FINAL
    const ultimaLineaDatos = posY + 6;
    const lineaY = Math.max(ultimaLineaDatos + 4, detalleY + 2);
    drawSeparationLine(lineaY);

    posY = lineaY + 4;
  });

  // ======================
  // IMPRESIÓN DE TOTALES
  // ======================
  posY;

  doc.setFontSize(8);
  doc.text(`TOTAL DEL DISTRIRO 043 INSTITUTO ${establecimiento.nroDiegep}`, 14, posY);

  doc.text(`DOCENTES: `, 92, posY);
  doc.text(`${totalDocentes}`, 150, posY);
  posY += 3;

  doc.text(`C/APORTES:`, 92, posY);
  doc.text(`${totalCAportes.toFixed(2)}`, 150, posY);
  posY += 3;

  doc.text(`S/APORTES - No Salario:`, 92, posY);
  doc.text(`${totalSAportes.toFixed(2)}`, 150, posY);
  posY += 3;

  doc.text(`SALARIO FAMILIAR:`, 92, posY);
  doc.text(`${totalSalarioFamiliar.toFixed(2)}`, 150, posY);
  posY += 3;

  doc.text(`DESCUENTOS:`, 92, posY);
  doc.text(`-${totalDescuentos.toFixed(2)}`, 150, posY);
  posY += 3;

  addFooters();

  doc.output("dataurlnewwindow");
};

export default HaberesPDF;
