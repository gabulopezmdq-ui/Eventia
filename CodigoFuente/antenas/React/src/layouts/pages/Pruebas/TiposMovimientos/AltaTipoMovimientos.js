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
import TipoMovimiento from ".";

function AltaTipoMovimiento() {
  const { id } = useParams();
  let labelTitulo = "Tipo Movimiento";
  if (id) {
    labelTitulo = "Editar Tipo Movimiento";
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
  function validateConcepto(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 4) {
      return "Los Conceptos no pueden tener más de 4 caracteres.";
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
          type: "select",
          label: "Tipo Movimiento",
          name: "tipoMovimiento",
          customOptions: [
            { value: "A", label: "ALTAS" },
            { value: "B", label: "BAJAS" },
            { value: "M", label: "MODIFICACIONES" },
            { value: "D", label: "ADICIONALES" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
        {
          type: "text",
          label: "Leyenda",
          name: "leyenda",
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

  const apiUrl = process.env.REACT_APP_API_URL + `TiposMovimientos`;
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

export default AltaTipoMovimiento;
