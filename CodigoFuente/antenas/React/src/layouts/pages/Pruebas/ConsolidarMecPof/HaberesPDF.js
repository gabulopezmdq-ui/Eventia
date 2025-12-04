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
  // FUNCION PARA DIBUJAR ENCABEZADO
  // ================================
  const drawHeader = () => {
    doc.text("PROVINCIA DE BUENOS AIRES - SERVICIOS DPTI -", 14, 15);
    doc.text("DIRECCION GENERAL DE CULTURA Y EDUCACION", 14, 19);
    doc.text("DIRECCION DE EDUCACION DE GESTION PRIVADA", 14, 23);
    doc.text("- P L A N I L L A  D E  H A B E R E S -", 17, 30);

    doc.text("Di.E.Ge.P", 100, 30);
    doc.text(`N/R PESOS ${establecimiento.ordenPago}  Sueldos Conv ME 421/09`, 180, 34);

    doc.text("DISTRITO :043  G Pueyrredon", 14, 37);
    doc.text(`TIPO ORG :${establecimiento.tipoEst} ${establecimiento.tipoEstDesc}`, 90, 37);
    doc.text(`INSTITUTO: ${establecimiento.nroDiegep} ${establecimiento.nombrePcia}`, 180, 37);

    doc.text(`RURAL: ${establecimiento.ruralidad}`, 65, 41);
    doc.text(`SECCS: ${establecimiento.cantSecciones}`, 110, 41);
    doc.text(`TURNOS: ${establecimiento.cantTurnos}`, 160, 41);
    doc.text(`SUBVENCION: ${establecimiento.subvencion} %`, 220, 41);

    // Línea divisoria
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
  const drawFooter = () => {
    doc.setFontSize(8);
    doc.text(
      `Página ${doc.internal.getCurrentPageInfo().pageNumber}`,
      14,
      doc.internal.pageSize.height - 10
    );
  };

  // ================================
  // INICIO PRIMERA PÁGINA
  // ================================
  drawHeader();

  let posY = 65;
  const altoDocente = 40;
  let countEnPagina = 0;

  docentes.forEach((d, i) => {
    if (countEnPagina === 4) {
      drawFooter();
      doc.addPage();
      drawHeader();
      posY = 65;
      countEnPagina = 0;
    }

    // Datos del docente
    doc.text(`${d.dni}/${d.secuencia}`, 16, posY);
    doc.text(`AFEC:${d.anioMesAfectacion} CATEG. ${d.categoria}`, 16, posY + 3);
    doc.text(`ANT:${d.anioAntiguedad}/${d.mesAntiguedad}`, 16, posY + 6);
    doc.text(`${d.apellido} ${d.nombre}`, 45, posY);
    doc.text(`${d.carRevista} ${d.tipoFuncion}`, 84, posY);
    doc.text(`NETO : ${d.neto}`, 205, posY);

    // AHORA DETALLE DE CÓDIGOS ABAJO
    let detalleY = posY;
    d.codigosLiquidacionDetallados.forEach((c) => {
      const signoMostrar = c.signo === "-" ? "-" : "";
      const linea = `${c.codigo} ${c.descripcion} ${signoMostrar}`;

      doc.text(linea, 92, detalleY);

      const importeTexto = Number(c.importe).toFixed(2);
      const xRight = 160;
      const textWidth = doc.getTextWidth(importeTexto);

      doc.text(importeTexto, xRight - textWidth, detalleY);

      detalleY += 4;
    });

    posY += altoDocente;
    countEnPagina++;
  });

  // Pie de la última página
  drawFooter();

  // Abrir nueva pestaña
  doc.output("dataurlnewwindow");
};

export default HaberesPDF;
