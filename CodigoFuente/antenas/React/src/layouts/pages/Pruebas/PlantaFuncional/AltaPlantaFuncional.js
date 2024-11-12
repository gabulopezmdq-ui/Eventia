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
import FormularioPlanta from "components/FormularioPlanta";

function AltaPlantaFuncional() {
  const { id } = useParams();
  let labelTitulo = "Alta TipoCategoria";
  if (id) {
    labelTitulo = "Editar TipoCategoria";
  }
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };
  //------------------------Validaciones Especificas-------------------------------------

  //----------------------Fin Validadciones--------------------
  const steps = [
    {
      label: labelTitulo,
      fields: [
        {
          type: "text",
          label: "Cod Tipo Cat.",
          name: "codCategoria",
          required: true,
        },
        {
          type: "text",
          label: "Cod Categoria MGP",
          name: "codCategoriaMGP",
          required: true,
        },
        {
          type: "text",
          label: "Descripcion",
          name: "descripcion",
          required: true,
        },
        {
          type: "select",
          label: "Vigente",
          name: "vigente",
          customOptions: [
            { value: "S", label: "Si" },
            { value: "S", label: "No" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `TiposCategorias`;
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <FormularioPlanta steps={steps} apiUrl={apiUrl} productId={id} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaPlantaFuncional;
