import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Box from "@mui/material/Box";
import FormularioGestion from "components/FormularioGestion";

function AltaGestionUsuario() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const labelTitulo = isEditMode ? "Editar Usuario de Red" : "Alta Usuario de Red";

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
        { type: "text", label: "Nombre de Red", name: "nombre", required: true },
        { type: "text", label: "Email de Red", name: "email", required: true },
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

  // Function to handle form submission
  const handleSubmit = async (data) => {
    const payload = { ...data, activo: isEditMode ? data.activo : true }; // Establecer `activo` como `true` para nuevos usuarios
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={0}>
        <Box
          display="flex"
          flexDirection="column" // Apila verticalmente el Card y el Grid
          justifyContent="center"
          alignItems="center"
          height="100vh"
          gap={0} // Espacio entre el Card y el Grid
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              height: "100%", // Mantiene la altura del Grid sin cambios
            }}
          >
            <Grid item xs={12} lg={10}>
              <FormularioGestion
                steps={steps}
                apiUrl={apiUrl}
                productId={id}
                handleSubmit={handleSubmit}
              />
            </Grid>
          </Grid>
        </Box>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaGestionUsuario;
