// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Formulario from "components/Formulario";
import MDDatePicker from "components/MDDatePicker";

//productoId seria el id de la maquina !!! si va vacio es uno nuevo y si va con ID es para editar

function AltaMaquina() {
  const { id, idObra } = useParams();
  console.log("ID de la Obra: " + idObra);
  let labelTitulo = "Alta Maquina";
  if (id) {
    labelTitulo = "Editar Maquina";
  }
  const steps = [
    {
      label: labelTitulo,
      fields: [
        {
          type: "select",
          label: "Conservadora",
          name: "idConservadora",
          apiUrl: "https://localhost:44382/conservadora/getall",
          valueField: "idConservadora",
          optionField: "nombre",
        },
        {
          type: "select",
          label: "Tipo de Equipamiento",
          name: "idTipoEquipamiento",
          apiUrl: "https://localhost:44382/tipoEquipamiento/getall",
          valueField: "idTipoEquipamiento",
          optionField: "descripcion",
        },
        { type: "text", label: "Cap. Carga", name: "capacidadCarga" },
        { type: "date", label: "Fecha de Fabricacion", name: "fechaFabricacion" },
        { type: "number", label: "Metros", name: "metros" },
        { type: "text", label: "Modelo", name: "modelo" },
        { type: "number", label: "Nro. Serie", name: "nroSerie" },
        { type: "text", label: "Observaciones", name: "observaciones" },
        { type: "number", label: "Paradas", name: "paradas" },
        { type: "checkbox", label: "Habilitado", name: "habilitado" },
        { type: "checkbox", label: "Activo", name: "activo" },
      ],
    },
  ];

  const apiUrl = `https://localhost:44382/maquina`;
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <Formulario steps={steps} apiUrl={apiUrl} productId={id} idObra={idObra} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaMaquina;
