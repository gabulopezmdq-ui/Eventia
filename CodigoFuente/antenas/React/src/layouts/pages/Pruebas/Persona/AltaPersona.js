// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import { useState } from "react";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import FormularioPersona from "components/FormularioPersona";
import { Field } from "formik";
import MDDropzone from "components/MDDropzone";

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function AltaPersona() {
  const { id } = useParams();
  let labelTitulo = "Alta Gestion Persona";
  if (id) {
    labelTitulo = "Editar Gestion Persona";
  }
  const [formData, setFormData] = useState({
    vigente: id ? "" : "S", // "vigente" es "S" solo si es alta (id no está presente)
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const steps = [
    {
      label: labelTitulo,
      fields: [
        { type: "text", label: "Nombre", name: "nombre", required: true },
        { type: "text", label: "Apellido", name: "apellido", required: true },
        { type: "number", label: "DNI", name: "dni", required: true },
        { type: "text", label: "Legajo", name: "legajo", required: true },
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

  const apiUrl = process.env.REACT_APP_API_URL + `Personas`;
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <FormularioPersona steps={steps} apiUrl={apiUrl} productId={id} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaPersona;
