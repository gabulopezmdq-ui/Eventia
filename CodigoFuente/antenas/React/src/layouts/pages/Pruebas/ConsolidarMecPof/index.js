import { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
// @mui material components
import Card from "@mui/material/Card";
import { Link, useNavigate, useParams } from "react-router-dom";
// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTableConsolidar from "examples/Tables/DataTableConsolidar";
import "../../Pruebas/pruebas.css";
function ConsolidarMecPof() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState();
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const [idCabeceras, setIdCabeceras] = useState([]);
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "POF/GetAll", {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => setDataTableData(response.data))
      .catch((error) => {
        if (error.response) {
          const statusCode = error.response.status;
          let errorMessage = "";
          let errorType = "error";
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema con la solicitud del cliente.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema en el servidor.`;
          }
          setErrorAlert({ show: true, message: errorMessage, type: errorType });
        } else {
          setErrorAlert({
            show: true,
            message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            type: "error",
          });
        }
      });
  }, []);
  useEffect(() => {
    axios
      .get("https://localhost:44382/CabeceraLiquidacion/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Mapea los datos para crear los valores concatenados
        const formattedCabeceras = response.data.map((item) => ({
          id: item.idCabecera, // Sigue usando idCabecera como identificador único
          displayText: `${item.tipoLiquidacion.descripcion} - ${item.mesLiquidacion}/${item.anioLiquidacion}`, // Concatenar los valores
        }));
        setIdCabeceras(formattedCabeceras);
      })
      .catch(() => {
        setErrorAlert({ show: true, message: "Error al cargar los idCabecera.", type: "error" });
      });
  }, [token]);

  const handleNuevoTipo = () => {
    navigate("/ConsolidarMecPofFE/Nuevo");
  };

  //Funcion para que cuando el campo viene vacio muestre N/A
  const displayValue = (value) => (value ? value : "N/A");

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDButton variant="gradient" color="success" onClick={handleNuevoTipo}>
          Agregar
        </MDButton>
        {errorAlert.show && (
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={12}>
              <MDBox pt={2}>
                <MDAlert color={errorAlert.type} dismissible>
                  <MDTypography variant="body2" color="white">
                    {errorAlert.message}
                  </MDTypography>
                </MDAlert>
              </MDBox>
            </Grid>
          </Grid>
        )}
        <MDBox my={3}>
          <Card>
            <Grid container spacing={2} sx={{ m: 3 }}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel
                    id="filter-label"
                    sx={{
                      "&.Mui-focused": { color: "#1A73E8" }, // Estilo al enfocar
                    }}
                  >
                    Seleccionar Cabecera
                  </InputLabel>
                  <Select
                    labelId="filter-label"
                    value={selectedIdCabecera}
                    onChange={(e) => setSelectedIdCabecera(e.target.value)}
                    sx={{
                      height: "40px",
                      "& .MuiSelect-select": {
                        height: "40px",
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                      },
                      "&:hover fieldset": {
                        borderColor: "#000", // Color del borde al pasar el mouse
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#000", // Color del borde al enfocar
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Seleccionar Cabecera</em>
                    </MenuItem>
                    {idCabeceras.map((item, index) => (
                      <MenuItem key={index} value={item.id}>
                        {item.displayText}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}></Grid>
            </Grid>
            <DataTableConsolidar
              table={{
                columns: [
                  { Header: "idTMP Mecanizada", accessor: "idTMPMecanizada" },
                  {
                    Header: "fecha Importacion",
                    accessor: "fechaImportacion",
                    Cell: ({ value }) =>
                      value ? new Date(value).toLocaleDateString("es-ES") : "N/A",
                  },
                  { Header: "mes Liquidacion", accessor: "mesLiquidacion" },
                ],
                rows: dataTableData,
              }}
              entriesPerPage={false}
              canSearch
              show
            />
          </Card>
        </MDBox>
      </DashboardLayout>
    </>
  );
}

ConsolidarMecPof.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default ConsolidarMecPof;
