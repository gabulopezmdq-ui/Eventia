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
import Formulario from "components/Formulario";
import { Field } from "formik";
import MDDropzone from "components/MDDropzone";

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

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
          valueField: "idTipoLiquidacion", // Nombre del campo del valor
          optionField: "descripcion",
          required: true,
        },
        { type: "text", label: "Mes Liquidacion", name: "mesLiquidacion", required: true },
        { type: "text", label: "Año Liquidacion", name: "anioLiquidacion", required: true },
        { type: "text", label: "Observaciones", name: "observaciones", required: true },
        { type: "date", label: "Inicio Liquidacion", name: "inicioLiquidacion", required: true },
        { type: "date", label: "Fin Liquidacion", name: "finLiquidacion", required: true },
        { type: "text", label: "Estado", name: "estado", required: true },
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
