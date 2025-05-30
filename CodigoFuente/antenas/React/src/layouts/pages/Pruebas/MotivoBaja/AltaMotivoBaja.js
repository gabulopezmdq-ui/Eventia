import React, { useState, useEffect } from "react";
// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";
import { Field } from "formik";
import MDDropzone from "components/MDDropzone";

function AltaMotivosBajas() {
  const { id } = useParams();
  let labelTitulo = "Motivo de baja";
  if (id) {
    labelTitulo = "Editar Baja";
  }

  // Configuración inicial de formData para incluir "vigente" como "S" si es una alta
  const [formData, setFormData] = useState({
    vigente: id ? "" : "S", // "vigente" es "S" solo si es alta (id no está presente)
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  //------------------------Validaciones Especificas-------------------------------------
  function validateMotivoBaja(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 500) {
      return "Los Motivos de baja no pueden tener más de 500 caracteres.";
    }
    return null;
  }
  //----------------------Fin Validadciones--------------------

  // Configuración de pasos, excluyendo el campo "Vigente" si es una alta
  const steps = [
    {
      label: labelTitulo,
      fields: [
        {
          type: "text",
          label: "Motivo Baja",
          name: "motivobaja",
          required: true,
        },
        // Solo incluimos el campo "Vigente" si estamos en modo edición (id está presente)
        ...(id
          ? [
              {
                type: "select",
                label: "Vigente",
                name: "vigente",
                customOptions: [
                  { value: "S", label: "Si" },
                  { value: "N", label: "No" },
                ],
                valueField: "value",
                optionField: "label",
                required: true,
              },
            ]
          : []),
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `MotivosBajasDoc`;
  const handleSubmit = () => {
    const dataToSubmit = { ...formData };
    if (!id && !dataToSubmit.vigente) {
      dataToSubmit.vigente = "S"; // Aseguramos que "vigente" se envíe como "S" en el alta
    }
    // Llamar a Formulario con dataToSubmit
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <Formulario steps={steps} apiUrl={apiUrl} productId={id} initialValues={formData} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaMotivosBajas;
