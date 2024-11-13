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

function AltaEstablecimiento() {
  const { id } = useParams();
  let labelTitulo = "Alta Establecimiento";
  if (id) {
    labelTitulo = "Editar Establecimiento";
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
  //------------------------Validaciones Especificas-------------------------------------
  function validateDiegep(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 5) {
      return "Los Nros. de Diegep no pueden tener más de 4 caracteres.";
    }
    return null;
  }
  function validateSecciones(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 2) {
      return "Las Secciones no pueden tener más de 2 caracteres.";
    }
    return null;
  }
  function validateTurnos(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 2) {
      return "Los Turnos no pueden tener más de 2 caracteres.";
    }
    return null;
  }
  function validateSubvenciones(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > 4) {
      return "Las Subvenciones no pueden tener más de 3 caracteres.";
    }
    return null;
  }
  //----------------------Fin Validadciones--------------------
  const steps = [
    {
      label: labelTitulo,
      fields: [
        {
          type: "text",
          label: "Nro. Diegep",
          name: "nroDiegep",
          required: true,
          customValidation: validateDiegep,
        },
        {
          type: "select",
          label: "Tipo Establecimiento.",
          name: "idTipoEstablecimiento",
          apiUrl: process.env.REACT_APP_API_URL + "TiposEstablecimientos/GetAll",
          valueField: "idTipoEstablecimiento",
          optionField: "descripcion",
          required: true,
        },
        {
          type: "text",
          label: "Nro. Establecimiento",
          name: "nroEstablecimiento",
          required: true,
        },
        {
          type: "text",
          label: "Nombre MGP",
          name: "nombreMgp",
          required: true,
        },
        {
          type: "text",
          label: "Nombre Provincia",
          name: "nombrePcia",
          required: true,
        },
        {
          type: "text",
          label: "Domicilio",
          name: "domicilio",
          required: true,
        },
        {
          type: "text",
          label: "Telefono",
          name: "telefono",
          required: true,
        },
        {
          type: "text",
          label: "UE",
          name: "ue",
          required: true,
        },
        {
          type: "text",
          label: "Cant. Secciones",
          name: "cantSecciones",
          required: true,
          customValidation: validateSecciones,
        },
        {
          type: "text",
          label: "Cant. Turnos",
          name: "cantTurnos",
          required: true,
          customValidation: validateTurnos,
        },
        {
          type: "text",
          label: "Ruralidad",
          name: "ruralidad",
          required: true,
        },
        {
          type: "text",
          label: "Subvención",
          name: "subvencion",
          required: true,
          customValidation: validateSubvenciones,
        },
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

  const apiUrl = process.env.REACT_APP_API_URL + `Establecimientos`;
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

export default AltaEstablecimiento;
