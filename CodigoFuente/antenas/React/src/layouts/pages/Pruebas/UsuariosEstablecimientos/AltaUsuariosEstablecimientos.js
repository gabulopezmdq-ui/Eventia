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

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function AltaUsuariosEstablecimientos() {
  const { id } = useParams();
  let labelTitulo = "Alta Usuarios Establecimientos";
  if (id) {
    labelTitulo = "Editar Usuarios Establecimientos";
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
        {
          type: "select",
          label: "Usuario",
          name: "idUsuario",
          apiUrl: process.env.REACT_APP_API_URL + "Usuarios/GetAll",
          valueField: "idUsuario", // Sigue siendo el identificador único
          optionField: "idUsuario", // Ahora muestra el nombre del usuario
          required: true,
        },
        {
          type: "select",
          label: "Establecimiento",
          name: "idEstablecimiento",
          apiUrl: process.env.REACT_APP_API_URL + "Establecimientos/GetAll",
          valueField: "idEstablecimiento",
          optionField: "nroEstablecimiento",
          required: true,
        },
        {
          type: "select",
          label: "Tipo de Categoria",
          name: "idTipoCategoria",
          apiUrl: process.env.REACT_APP_API_URL + "TiposCategorias/GetAll",
          valueField: "idTipoCategoria",
          optionField: "descripcion",
          required: true,
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

  const apiUrl = process.env.REACT_APP_API_URL + `UsuariosEstablecimientos`;
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

export default AltaUsuariosEstablecimientos;
