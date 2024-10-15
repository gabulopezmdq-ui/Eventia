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

function AltaPOF() {
  const { id } = useParams();
  let labelTitulo = "Alta POF";
  if (id) {
    labelTitulo = "Editar POF";
  }
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };
  //------------------------Validaciones Especificas-------------------------------------
  function validateSecuencia(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 2) {
      return "Las Secuencia no pueden tener más de 3 caracteres.";
    }
    return null;
  }
  function validateBarra(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 2) {
      return "Las Barras no pueden tener más de 2 caracteres.";
    }
    return null;
  }
  function validateTipoCargo(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 1) {
      return "Los Cargos no pueden tener más de 1 caracteres.";
    }
    return null;
  }
  function validateCantHs(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 4) {
      return "La Cantidad de Horas no pueden tener más de 4 caracteres.";
    }
    return null;
  }
  function validateAntigAnios(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 2) {
      return "La Antig. Años no pueden tener más de 2 caracteres.";
    }
    return null;
  }
  function validateAntigMeses(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 2) {
      return "La Antig. Meses no pueden tener más de 2 caracteres.";
    }
    return null;
  }
  //----------------------Fin Validadciones--------------------
  const steps = [
    {
      label: labelTitulo + " Paso 1",
      fields: [
        {
          type: "select",
          label: "Persona",
          name: "idPersona",
          apiUrl: process.env.REACT_APP_API_URL + "Personas/GetAll",
          valueField: "idPersona",
          optionField: "Apellido", // concatenar nombre
          required: true,
        },
        {
          type: "text",
          label: "Secuencia",
          name: "secuencia",
          required: true,
          customValidation: validateSecuencia,
        },
        {
          type: "text",
          label: "Barra",
          name: "barra",
          required: true,
          customValidation: validateBarra,
        },
        {
          type: "select",
          label: "Categoria",
          name: "idTipoCategoria",
          apiUrl: process.env.REACT_APP_API_URL + "TiposCategorias/GetAll",
          valueField: "idCategoria",
          optionField: "Descripcion",
          required: true,
        },
        {
          type: "text",
          label: "Tipo Cargo",
          name: "tipoCargo",
          required: true,
          customValidation: validateTipoCargo,
        },
        {
          type: "text",
          label: "Cant. Hs.",
          name: "cantHsCargo",
          required: true,
          customValidation: validateCantHs,
        },
        {
          type: "text",
          label: "Antig. Años",
          name: "antigAnios",
          required: true,
          customValidation: validateAntigAnios,
        },
        {
          type: "text",
          label: "Antig. Mese",
          name: "tantigMese",
          required: true,
          customValidation: validateAntigMeses,
        },
        {
          type: "select",
          label: "Sin Haberes",
          name: "sinHaberes",
          customOptions: [
            { value: "S", label: "Si" },
            { value: "S", label: "No" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
        {
          type: "select",
          label: "Subvencionada",
          name: "subvencionada",
          customOptions: [
            { value: "S", label: "Si" },
            { value: "S", label: "No" },
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
            { value: "S", label: "No" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `POF`;
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

export default AltaPOF;
