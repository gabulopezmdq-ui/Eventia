import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";

function AltaEstadoTramite() {
  const { id } = useParams();
  let labelTitulo = "Alta Empresa";
  if (id) {
    labelTitulo = "Editar Empresa";
  }
  const steps = [
    {
      label: "Info General",
      fields: [
        {
          type: "text",
          label: "Estado",
          name: "estado",
        },
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `ANT_EstadoTramite`;

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

export default AltaEstadoTramite;
