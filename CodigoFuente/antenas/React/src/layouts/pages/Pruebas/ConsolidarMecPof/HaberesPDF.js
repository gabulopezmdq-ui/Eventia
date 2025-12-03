import jsPDF from "jspdf";
import "jspdf-autotable";

const HaberesPDF = async (reporteData) => {
  const { establecimiento } = reporteData;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("courier", "normal");

  // ======================================================
  // ENCABEZADO
  // ======================================================
  doc.setFontSize(8);
  // Textos del encabezado
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

  // ======================================================
  // VARIABLES DE DISEÑO COMUNES
  // =====================================================
  const margenX = 14;
  const anchoPagina = doc.internal.pageSize.getWidth();
  const anchoDisponible = anchoPagina - margenX * 2;

  // ======================================================
  // 1. LÍNEA DIVISORIA DINÁMICA (# - - - #)
  // ======================================================
  const posY_Linea = 46;
  const inicio = "#";
  const patron = " -";
  const fin = " #";

  let lineaSeparadora = inicio;
  while (doc.getTextWidth(lineaSeparadora + patron + fin) < anchoDisponible) {
    lineaSeparadora += patron;
  }
  lineaSeparadora += fin;

  // Imprimimos la línea divisoria
  doc.text(lineaSeparadora, margenX, posY_Linea);

  // ======================================================
  // 2. ENCABEZADO DE COLUMNAS (TABLA ESTILO TEXTO)
  // ======================================================
  const posY_Encabezado = posY_Linea + 4; // Unos milímetros más abajo
  // El string exacto que solicitaste
  const textoEncabezado = "* * Datos *R  F* * * Descuentos     * * NRO. CHEQUE Y   * NRO. *";
  // --- Lógica para justificar el texto (stretch) ---
  // Calculamos cuánto mide el texto normalmente
  const anchoTextoNormal = doc.getTextWidth(textoEncabezado);
  // Calculamos cuánto espacio nos sobra
  const espacioFaltante = anchoDisponible - anchoTextoNormal;
  // Dividimos ese espacio entre la cantidad de caracteres para distribuirlo
  // (Esto hace que el primer * toque el margen izq y el último * toque el margen der)
  const espacioEntreCaracteres = espacioFaltante / (textoEncabezado.length - 1);

  // Cambiamos a negrita para que parezca encabezado real
  doc.setFont("courier", "normal");
  // Imprimimos con el espaciado calculado (charSpace se pasa en las opciones)
  doc.text(textoEncabezado, margenX, posY_Encabezado, {
    charSpace: espacioEntreCaracteres,
  });

  // Volvemos a fuente normal para lo que siga después
  doc.setFont("courier", "normal");

  // ======================================================
  // PIE DE PÁGINA
  // ======================================================
  doc.setFontSize(8);
  doc.text("Página 1", 14, doc.internal.pageSize.height - 10);

  // Abrir en nueva pestaña
  doc.output("dataurlnewwindow");
};

export default HaberesPDF;
