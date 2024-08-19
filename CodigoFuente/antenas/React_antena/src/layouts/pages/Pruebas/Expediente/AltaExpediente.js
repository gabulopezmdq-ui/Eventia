import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";

function AltaExpediente() {
  const { id } = useParams();
  let labelTitulo = "Alta Expediente";
  if (id) {
    labelTitulo = "Editar Expediente";
  }
  const steps = [
    {
      label: "Paso 1",
      fields: [
        { type: "text", label: "Acometida Energia", name: "acometidaEnergia" },
        { type: "text", label: "Acta Asamblea", name: "actaAsamblea" },
        { type: "text", label: "AEnacom", name: "aEnacom" },
        { type: "text", label: "Anac", name: "anac" },
        { type: "text", label: "Certificado Dominio", name: "certificadoDominio" },
        { type: "text", label: "Compromiso Desmonte", name: "compromisoDesmonte" },
        { type: "text", label: "Constancia Pago", name: "constanciaPago" },
        { type: "text", label: "Contrato Locacion", name: "contratoLocacion" },
        { type: "text", label: "Contrato Representante", name: "contratoRepresentante" },
        { type: "text", label: "Contrato Responsable SH", name: "contratoResponsableSH" },
        { type: "text", label: "Copia Convenio CNC", name: "copiaConvenioCNC" },
        { type: "text", label: "Cronograma Obra", name: "cronogramaObra" },
        { type: "text", label: "Cuadro Potencia", name: "cuadroPotencia" },
      ],
    },
    {
      label: "Paso 2",
      fields: [
        { type: "text", label: "Cuadro Verif Conduc", name: "cuadroVerifConduc" },
        { type: "text", label: "Fact AmbienteBA", name: "factAmbienteBA" },
        { type: "date", label: "Fecha Emision", name: "fechaEmision", required: true },
        { type: "date", label: "Fecha TasaA", name: "fechaTasaA", required: true },
        { type: "text", label: "Impacto Ambiental", name: "impactoAmbiental" },
        { type: "text", label: "Layout Electrica", name: "layoutElectrica" },
        { type: "text", label: "Libre Deuda", name: "libreDeuda" },
        { type: "text", label: "Medicion Radiacion", name: "medicionRadiacion" },
        { type: "text", label: "Memoria Calculo", name: "memoriaCalculo" },
        { type: "text", label: "Nombre Exp", name: "nombreExp" },
        { type: "text", label: "Nro Expediente", name: "nroExpediente" },
        { type: "text", label: "Observaciones", name: "observaciones" },
      ],
    },
    {
      label: "Paso 3",
      fields: [
        { type: "text", label: "Ordenamiento Territorial", name: "ordenamientoTerritorial" },
        { type: "text", label: "Permiso Ambiental", name: "permisoAmbiental" },
        { type: "text", label: "Plano Civil", name: "planoCivil" },
        { type: "text", label: "Plano Construccion", name: "planoConstruccion" },
        { type: "text", label: "Planos", name: "planos" },
        { type: "text", label: "Poder Tramite", name: "poderTramite" },
        { type: "text", label: "Poliza SeguroCT", name: "polizaSeguroCT" },
        { type: "text", label: "Registro DGOP", name: "registroDGOP" },
        { type: "text", label: "Reglamento Copropiedad", name: "reglamentoCopropiedad" },
        { type: "text", label: "Seguridad Higiene", name: "seguridadHigiene" },
      ],
    },
    {
      label: "Paso 4",
      fields: [
        { type: "text", label: "SeguroRespCivil", name: "seguroRespCivil" },
        { type: "text", label: "Sist Baliza", name: "sistBaliza" },
        { type: "text", label: "Sis tProtAtmos", name: "sistProtAtmos" },
        { type: "text", label: "Sist Puesta Tierra", name: "sistPuestaTierra" },
        { type: "text", label: "Tasa Anual", name: "tasaAnual" },
        { type: "text", label: "Tasa Sigem", name: "tasaSigem" },
        { type: "text", label: "UnifiliarGral", name: "unifiliarGral" },
        { type: "number", label: "Estado Tramite", name: "estadoTramite" },
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `ANT_Expedientes`;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaExpediente;
