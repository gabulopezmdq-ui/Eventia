// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Formulario from "components/Formulario";

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />

function AltaObraTipo() {
  const { id } = useParams();
  const steps = [
    {
      label: "Alta Obra Tipo",
      fields: [
        { type: "text", label: "Nombre", name: "nombre", required: true },
        { type: "text", label: "Observaciones", name: "observaciones" },
        {
          type: "select",
          label: "Administracion",
          name: "idAdministracion",
          apiUrl: "https://localhost:44382/administracion/getall",
          valueField: "idAdministracion", // Nombre del campo del valor
          optionField: "nombre", // Nombre del campo de la opción
        },
        { type: "number", label: "Id Calle", name: "idCalle" },
        { type: "number", label: "Altura", name: "altura" },
        { type: "text", label: "Expediente", name: "expediente" },
        { type: "date", label: "Fecha Act", name: "fechaAct" },
        { type: "date", label: "Fecha Instalacion", name: "fechaIns" },
        { type: "date", label: "Fecha Libro", name: "fechaLibro" },
        { type: "number", label: "Libro", name: "libro" },
        { type: "text", label: "Observaciones", name: "observaciones" },
        { type: "checkbox", label: "Habilitado", name: "habilitado" },
        { type: "checkbox", label: "Activo", name: "activo" },
      ],
    },
  ];

  const apiUrl = `https://localhost:44382/obra`;
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

export default AltaObraTipo;
