// @mui material components
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import { useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Formulario from "components/Formulario";

function AltaRetenciones() {
  const { id } = useParams();
  let labelTitulo = "Alta Retenciones";
  if (id) {
    labelTitulo = "Editar Retenciones";
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
        { type: "text", label: "Descripción", name: "descripcion", required: true },
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

  const apiUrl = process.env.REACT_APP_API_URL + `Retenciones`;
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

export default AltaRetenciones;
