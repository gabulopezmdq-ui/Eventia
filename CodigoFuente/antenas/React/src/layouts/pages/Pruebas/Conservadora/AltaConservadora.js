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

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function AltaConservadora() {
  const { id } = useParams();
  let labelTitulo = "Alta Conservadora";
  if (id) {
    labelTitulo = "Editar Conservadora";
  }
  const steps = [
    {
      label: labelTitulo + " Paso 1",
      fields: [
        { type: "text", label: "Nombre", name: "nombre", required: true },
        { type: "number", label: "Telefono", name: "telefono" },
        { type: "text", label: "Mail", name: "email" },
        {
          type: "select",
          label: "Calle",
          name: "idCalle",
          apiUrl: process.env.REACT_APP_API_URL + "calle/GetAll",
          valueField: "idCalle", // Nombre del campo del valor
          optionField: "nombre",
          required: true,
        },
        { type: "number", label: "Altura", name: "altura", required: true },
        { type: "number", label: "Cant. Operarios", name: "cantOpe" },
        { type: "number", label: "Departamentos", name: "dto" },
        { type: "text", label: "Expediente", name: "expediente" },
      ],
    },
    {
      label: labelTitulo + " Paso 2",
      fields: [
        {
          type: "select",
          label: "Seguro",
          name: "idSeguro",
          apiUrl: process.env.REACT_APP_API_URL + "seguro/getall",
          valueField: "idSeguro", // Nombre del campo del valor
          optionField: "nombre",
        },
        { type: "date", label: "Fecha Desde Seguro", name: "fechaDesdeSeguro" },
        { type: "date", label: "Fecha Hasta Seguro", name: "fechaHastaSeguro" },
        { type: "text", label: "Mat.Municipal", name: "matMuni" },
        { type: "date", label: "Fecha Desde Mat.Municipal", name: "fechaDesdeMatMunicipal" },
        { type: "date", label: "Fecha Hasta Mat.Municipal", name: "fechaHastaMatMunicipal" },
        { type: "checkbox", label: "Habilitado", name: "habilitado" },
        { type: "checkbox", label: "Activo", name: "activo" },
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
    </DashboardLayout>
  );
}

export default AltaConservadora;
