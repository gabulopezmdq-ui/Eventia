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

function AltaConceptos() {
  const { id } = useParams();
  let labelTitulo = "Alta Conceptos";
  if (id) {
    labelTitulo = "Editar Conceptos";
  }
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };
  //------------------------Validaciones Especificas-------------------------------------
  function validateConcepto(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 4) {
      return "Los Conceptos no pueden tener más de 4 caracteres.";
    }
    return null;
  }
  function validateCodMGP(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 10) {
      return "Los Códigos MGP no pueden tener más de 10 caracteres.";
    }
    return null;
  }
  //----------------------Fin Validadciones--------------------
  const steps = [
    {
      label: labelTitulo + " Paso 1",
      fields: [
        {
          type: "text",
          label: "Cod Concepto",
          name: "codConcepto",
          required: true,
          customValidation: validateConcepto,
        },
        {
          type: "text",
          label: "Cod Concepto MGP",
          name: "codConceptoMgp",
          required: true,
          customValidation: validateCodMGP,
        },
        {
          type: "text",
          label: "Descripcion",
          name: "descripcion",
          required: true,
        },
        {
          type: "select",
          label: "Con Aporte",
          name: "conAporte",
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
          label: "Patronal",
          name: "patronal",
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

  const apiUrl = process.env.REACT_APP_API_URL + `Conceptos`;
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

export default AltaConceptos;
