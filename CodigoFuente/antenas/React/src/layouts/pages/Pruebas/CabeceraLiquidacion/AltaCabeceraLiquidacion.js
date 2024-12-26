// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import { useState } from "react";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Formulario from "components/Formulario";

function AltaCabeceraLiquidacion() {
  const { id } = useParams();
  let labelTitulo = "Alta Cabecera Liquidacion";
  if (id) {
    labelTitulo = "Editar Cabecera Liquidacion";
  }
  const [formData, setFormData] = useState({});

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
        {
          type: "select",
          label: "Tipo de Liquidacion",
          name: "idTipoLiquidacion",
          apiUrl: process.env.REACT_APP_API_URL + "TiposLiquidaciones/GetAll",
          valueField: "idTipoLiquidacion",
          optionField: "descripcion",
          required: true,
        },
        {
          type: "text",
          label: "Leyenda Tipo Liq.Reporte",
          name: "leyendaTipoLiqReporte",
          required: true,
        },
        { type: "text", label: "Mes Liquidacion", name: "mesLiquidacion", required: true },
        { type: "text", label: "Año Liquidacion", name: "anioLiquidacion", required: true },
        { type: "text", label: "Usuario Liquidacion", name: "usuarioLiquidacion", required: true },
        { type: "text", label: "Observaciones", name: "observaciones", required: true },
        { type: "date", label: "Inicio Liquidacion", name: "inicioLiquidacion", required: true },
        { type: "date", label: "Fin Liquidacion", name: "finLiquidacion", required: true },
        {
          type: "select",
          label: "Estado",
          name: "estado",
          customOptions: [
            { value: "P", label: "Pendiente Importación" },
            { value: "I", label: "Archivo Importado" },
            { value: "R", label: "Archivo Procesado" },
            { value: "B", label: "Inasistencias / Bajas Procesado" },
            { value: "L", label: "En Liquidación" },
            { value: "C", label: "Liquidación cerrada" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
        {
          type: "select",
          label: "Calcula Inasistencias",
          name: "calculaInasistencias",
          customOptions: [
            { value: "S", label: "Si" },
            { value: "N", label: "No" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
        {
          type: "select",
          label: "Calcula Bajas",
          name: "CalculaBajas",
          customOptions: [
            { value: "S", label: "Si" },
            { value: "N", label: "No" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
        {
          type: "text",
          label: "Observaciones Inasistencias",
          name: "observacionesInasistencias",
          required: true,
        },
        { type: "text", label: "Observaciones Bajas", name: "observacionesBajas", required: true },
        { type: "number", label: "Cant. Docentes", name: "cantDocentes", required: true },
        { type: "number", label: "RetenDeno7", name: "retenDeno7", required: true },
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
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `CabeceraLiquidacion`;
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

export default AltaCabeceraLiquidacion;
