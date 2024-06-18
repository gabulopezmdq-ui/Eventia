import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";

function AltaInspeccion() {
  const { id } = useParams();
  const steps = [
    {
      label: "Info General",
      fields: [
        { type: "date", label: "Fecha de inspección", name: "fecha", required: true },
        { type: "number", label: "Expediente", name: "expediente" },
        { type: "text", label: "Inspector", name: "inspector" },
        { type: "text", label: "Departamento", name: "departamento" },
        { type: "text", label: "Empresa", name: "empresa" },
        {
          type: "select",
          label: "Dirección",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Representante tecnico",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
      ],
    },
    {
      label: "Ubicación y tipo de estructura",
      fields: [
        { type: "text", label: "Nombre del sitio", name: "nombre del sitio", required: true },
        { type: "number", label: "Código del sitio", name: "codigo del sitio " },
        { type: "tetx", label: "Dirección", name: "direccion" },
        { type: "text", label: "Localidad", name: "localidad" },
        { type: "text", label: "Partido", name: "partido" },
        { type: "text", label: "Provincia", name: "provincia" },
        { type: "text", label: "Emplazamiento", name: "emplazamiento" },
        { type: "text", label: "A nivel", name: "nivel" },
        { type: "text", label: "En edificio", name: "edificio" },
        {
          type: "select",
          label: "Tipo estructura",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
      ],
    },
    {
      label: "Otro mas",
      fields: [
        { type: "text", label: "Altura soporte", name: "altura soporte", required: true },
        { type: "number", label: "Altura total", name: "altura total " },
        { type: "tetx", label: "Tipo de sala de equipo", name: "tipo de sala de equipo" },
        { type: "text", label: "Localidad", name: "localidad" },
        {
          type: "select",
          label: "Tipo de mimetizado",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        { type: "text-area", label: "observacion", name: "observacion" },
        { type: "checkbox", label: "Habilitado", name: "habilitado" },
      ],
    },
    {
      label: "Inspección visual",
      fields: [
        {
          type: "select",
          label: "Porton de acceso a la estación, estado de cerradura",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Alambrado perimetral y cocertina de seguridad",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Desmalezado, dranajes y limpieza del área de ocupación de la estación",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Cámaras de pase. (puesta tierra, fo, energia)",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Obstrucciones en caños soterrados (puesta a tierra, fo, energia)",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        { type: "checkbox", label: "Habilitado", name: "habilitado" },
      ],
    },
    {
      label: "Elementos de ascenso",
      fields: [
        {
          type: "select",
          label: "Escalera de ascenso con guarda hombre",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Plataforms de inspección de antenas",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Salva caídas (Cable de vida)",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Soportes y fijaciones de bandejas guias de onda desde quípos a antenas",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Soporte u fijaciones de cañerias desde equipos a antenas",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle",
          optionField: "nombre",
        },
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

export default AltaInspeccion;
