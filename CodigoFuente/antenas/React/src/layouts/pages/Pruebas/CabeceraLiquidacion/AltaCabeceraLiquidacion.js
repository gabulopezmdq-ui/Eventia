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

  // Configuración inicial de formData para incluir "vigente" como "S" si es una alta
  const [formData, setFormData] = useState({
    vigente: id ? "" : "S", // "vigente" es "S" solo si es alta (id no está presente)
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  function validateVarchar(value, field, maxLength) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length > maxLength) {
      return `${field.label} no puede tener más de ${maxLength} caracteres.`;
    }
    return null;
  }

  function validateChar(value, field, exactLength) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (value.length !== exactLength) {
      return `${field.label} debe tener exactamente ${exactLength} caracteres.`;
    }
    return null;
  }

  function validateNumber(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    if (isNaN(value)) {
      return `${field.label} debe ser un número válido.`;
    }
    return null;
  }

  function validateDecimal(value, field) {
    if (value === undefined || value === null || value === "" || field.name === undefined) {
      return null;
    }
    const decimalRegex = /^(\d+(\.\d{1,2})?)$/;
    if (!decimalRegex.test(value)) {
      return `${field.label} debe ser un número decimal válido con hasta 2 decimales.`;
    }
    return null;
  }
  //--------------------FIN VALIDACIONES----------------------//

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
          customValidation: (value, field) => validateVarchar(value, field, 100),
          required: true,
        },
        {
          type: "text",
          label: "Mes Liquidacion",
          name: "mesLiquidacion",
          customValidation: (value, field) => validateChar(value, field, 2),
          required: true,
        },
        {
          type: "text",
          label: "Año Liquidacion",
          name: "anioLiquidacion",
          customValidation: (value, field) => validateChar(value, field, 4),
          required: true,
        },
        /*{
          type: "text",
          label: "Usuario Liquidacion",
          name: "idUsuario",
          customValidation: (value, field) => validateVarchar(value, field, 50),
          required: true,
        },*/
        {
          type: "select",
          label: "Usuario Liquidación",
          name: "idUsuario",
          apiUrl: process.env.REACT_APP_API_URL + "Usuarios/getall",
          valueField: "idUsuario",
          optionField: "nombre",
          required: true,
        },
        {
          type: "text",
          label: "Observaciones",
          name: "observaciones",
          customValidation: (value, field) => validateVarchar(value, field, 1000),
          required: true,
        },
        /*{
          type: "text",
          label: "Observaciones Inasistencias",
          name: "observacionesInasistencias",
          customValidation: (value, field) => validateVarchar(value, field, 1000),
        },*/
        /*{
          type: "text",
          label: "Observaciones Bajas",
          name: "observacionesBajas",
          customValidation: (value, field) => validateVarchar(value, field, 1000),
        },*/
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
          name: "calculaBajas",
          customOptions: [
            { value: "S", label: "Si" },
            { value: "N", label: "No" },
          ],
          valueField: "value",
          optionField: "label",
          required: true,
        },
        {
          type: "number",
          label: "Cant. Docentes",
          name: "cantDocentes",
          customValidation: validateNumber,
        },
        {
          type: "number",
          label: "RetenDeno7",
          name: "retenDeno7",
          customValidation: validateDecimal,
        },
        // Solo incluimos el campo "Vigente" si estamos en modo edición (id está presente)
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

  const apiUrl = process.env.REACT_APP_API_URL + `CabeceraLiquidacion`;
  const handleSubmit = () => {
    const dataToSubmit = { ...formData };
    if (!id && !dataToSubmit.vigente) {
      dataToSubmit.vigente = "S"; // Aseguramos que "vigente" se envíe como "S" en el alta
    }
    // Llamar a Formulario con dataToSubmit
  };
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
