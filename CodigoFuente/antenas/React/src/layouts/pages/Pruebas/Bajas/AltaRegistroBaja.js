// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";
import axios from "axios";
import { Field } from "formik";
import MDDropzone from "components/MDDropzone";

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function AltaRegistroBaja() {
  const { id } = useParams();
  let labelTitulo = "Nuevo Registro de Baja";
  if (id) {
    labelTitulo = "Editar Tipo Categoria";
  }
  const [formData, setFormData] = useState({
    vigente: id ? "" : "S", // "vigente" es "S" solo si es alta (id no está presente)
    nroDiegep: "",
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const fetchEstablecimiento = async () => {
      if (formData.idEstablecimiento) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}Establecimientos/GetById/${formData.idEstablecimiento}`
          );
          const diegep = response.data.nroDiegep || "";

          setFormData((prev) => ({
            ...prev,
            nroDiegep: diegep,
          }));
        } catch (err) {
          console.error("Error cargando nroDiegep", err);
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          nroDiegep: "",
        }));
      }
    };

    fetchEstablecimiento();
  }, [formData.idEstablecimiento]);

  const steps = [
    {
      label: labelTitulo,
      fields: [
        {
          type: "select",
          label: "Nivel",
          name: "idTipoEstablecimiento",
          apiUrl: process.env.REACT_APP_API_URL + "TiposEstablecimientos/GetAll",
          valueField: "idTipoEstablecimiento",
          optionField: "descripcion",
          required: true,
        },
        { type: "date", label: "Año", name: "codCategoriaMGP", required: true },
        {
          type: "select",
          label: "Establecimiento",
          name: "idEstablecimiento",
          apiUrl: process.env.REACT_APP_API_URL + "Establecimientos/GetAll",
          valueField: "idEstablecimiento",
          optionField: "nombreMgp",
          required: true,
        },
        {
          type: "text",
          label: "Nro DIEGEP",
          name: "nroDiegep",
          readOnly: true,
        },
        {
          type: "select",
          label: "Docente",
          name: "idTipoCategoria",
          apiUrl: process.env.REACT_APP_API_URL + "TiposCategorias/GetAll",
          valueField: "idTipoCategoria",
          optionField: "descripcion",
          required: true,
        },
        { type: "number", label: "Suplente Nro Documento", name: "descripcion", required: true },
        { type: "text", label: "Apellido/s", name: "descripcion", required: true },
        { type: "text", label: "Nombre/s", name: "descripcion", required: true },
        { type: "date", label: "Inicio", name: "descripcion", required: true },
        { type: "date", label: "Fin", name: "descripcion", required: true },
        { type: "number", label: "Cant Hs.", name: "descripcion", required: true },
        {
          type: "select",
          label: "Motivo",
          name: "idTipoCategoria",
          apiUrl: process.env.REACT_APP_API_URL + "TiposCategorias/GetAll",
          valueField: "idTipoCategoria",
          optionField: "descripcion",
          required: true,
        },
        {
          type: "select",
          label: "Estado",
          name: "idTipoCategoria",
          apiUrl: process.env.REACT_APP_API_URL + "TiposCategorias/GetAll",
          valueField: "idTipoCategoria",
          optionField: "descripcion",
          required: true,
        },
        {
          type: "select",
          label: "Ingreso",
          name: "idTipoCategoria",
          apiUrl: process.env.REACT_APP_API_URL + "TiposCategorias/GetAll",
          valueField: "idTipoCategoria",
          optionField: "descripcion",
          required: true,
        },
        { type: "text-area", label: "Observaciones", name: "descripcion", required: true },
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

  const apiUrl = process.env.REACT_APP_API_URL + `TiposCategorias`;
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <Formulario
              steps={steps}
              apiUrl={apiUrl}
              productId={id}
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaRegistroBaja;
