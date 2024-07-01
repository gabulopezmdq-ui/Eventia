import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";

function AltaEmpresa() {
  const { id } = useParams();
  const steps = [
    {
      label: "Info General",
      fields: [
        { type: "date", label: "Fecha de inspección", name: "fecha", required: true },
        { type: "number", label: "Expediente", name: "expediente" },
        { type: "text", label: "Inspector", name: "inspector" },
        { type: "text", label: "Departamento", name: "departamento" },
      ],
    },
    {
      label: "Ubicación y tipo de estructura",
      fields: [
        { type: "text", label: "Nombre del sitio", name: "nombre del sitio", required: true },
        { type: "number", label: "Código del sitio", name: "codigo del sitio " },
        { type: "tetx", label: "Dirección", name: "direccion" },
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `conservadora`;

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

export default AltaEmpresa;
