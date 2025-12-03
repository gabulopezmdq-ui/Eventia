import jsPDF from "jspdf";
import "jspdf-autotable"; // ya no se usa pero lo dejo por si luego agregás tablas

const HaberesPDF = async (reporteData) => {
  const { establecimiento } = reporteData;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  doc.setFont("courier", "normal");
  // ======== ENCABEZADO =========
  doc.setFontSize(8);
  doc.text("PROVINCIA DE BUENOS AIRES - SERVICIOS DPTI -", 14, 15);
  doc.text("DIRECCION GENERAL DE CULTURA Y EDUCACION", 14, 19);
  doc.text("DIRECCION DE EDUCACION DE GESTION PRIVADA", 14, 23);
  doc.text("- P L A N I L L A  D E  H A B E R E S -", 17, 30);
  doc.text("Di.E.Ge.P", 100, 30);
  doc.text("N/R PESOS", 180, 34);
  // ======== INFORMACIÓN DEL ESTABLECIMIENTO =========
  doc.text("DISTRITO :043  G Pueyrredon", 14, 37);
  doc.text(`TIPO ORG :${establecimiento.tipoEst} ${establecimiento.tipoEstDesc}`, 90, 37);
  doc.text(`INSTITUTO: ${establecimiento.nroDiegep} ${establecimiento.nombrePcia}`, 180, 37);
  doc.text(`RURAL: ${establecimiento.ruralidad}`, 65, 41);
  doc.text(`SECCS: ${establecimiento.cantSecciones}`, 110, 41);
  doc.text(`TURNOS: ${establecimiento.cantTurnos}`, 160, 41);
  doc.text(`SUBVENCION: ${establecimiento.subvencion} %`, 220, 41);
  // ======== PIE DE PÁGINA =========
  doc.setFontSize(8);
  doc.text("Página 1", 14, doc.internal.pageSize.height - 10);

  // Abrir en nueva pestaña
  doc.output("dataurlnewwindow");
};

export default HaberesPDF;
