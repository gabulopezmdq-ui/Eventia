import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";

function AltaAntena() {
  const { id } = useParams();
  let labelTitulo = "Alta Antena";
  if (id) {
    labelTitulo = "Editar Antena";
  }
  const steps = [
    {
      label: "Info General",
      fields: [
        { type: "number", label: "Altura soporte", name: "alturaSoporte" },
        { type: "number", label: "Altura Total", name: "alturaTotal" },
        { type: "number", label: "Celular", name: "cellId" },
        { type: "number", label: "Codigo Sitio", name: "codigoSitio" },
        { type: "text", label: "Declarada", name: "declarada" },
        { type: "text", label: "Direccion", name: "direccion" },
        { type: "text", label: "Emplazamiento", name: "emplazamiento" },
        { type: "text", label: "Observaciones", name: "observaciones" },
        { type: "text", label: "Sala Equipos", name: "salaEquipos" },
        { type: "text", label: "tipo Mimetizado", name: "tipoMimetizado" },
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `ANT_Antenas`;

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
      <Footer />
    </DashboardLayout>
  );
}

export default AltaAntena;
