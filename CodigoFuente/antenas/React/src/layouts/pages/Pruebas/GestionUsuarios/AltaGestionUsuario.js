import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import { useState } from "react";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import FormularioGestion from "components/FormularioGestion";
import { Field } from "formik";
import MDDropzone from "components/MDDropzone";

// Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
// Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function AltaGestionUsuario() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const labelTitulo = isEditMode ? "Editar Gestion de Usuario" : "Alta Gestion de Usuario";

  // Set initial state with activo set to true for new users
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    activo: true, // Default to true for new users
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  // Define steps and conditionally add checkbox based on edit mode
  const steps = [
    {
      label: labelTitulo,
      fields: [
        {
          type: "text",
          label: "Ingrese Usuario de Red Municipal",
          name: "nombre",
          required: true,
        },
        { type: "text", label: "Email", name: "email", required: true },
        ...(isEditMode
          ? [
              {
                type: "checkbox",
                label: "Activo",
                name: "activo",
                checked: formData.activo,
                onChange: (e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    activo: e.target.checked,
                  })),
              },
            ]
          : []),
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `Usuarios`;
  const handleSubmit = async (data) => {
    const payload = { ...data, activo: isEditMode ? data.activo : true };
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <FormularioGestion
              steps={steps}
              apiUrl={apiUrl}
              productId={id}
              handleSubmit={handleSubmit}
            />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaGestionUsuario;
