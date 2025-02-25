import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import DataTable from "examples/Tables/DataTable";
function ConsolidarMecPOF() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [cabeceras, setCabeceras] = useState([]);
  const [selectedCabecera, setSelectedCabecera] = useState("");
  const [dataTableData, setDataTableData] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}CabeceraLiquidacion/getall`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCabeceras(response.data ? response.data.filter((item) => item.estado === "R") : []);
      })
      .catch((error) => {
        let errorMessage = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.";
        let errorType = "error";

        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema con la solicitud del cliente.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema en el servidor.`;
          }
        }

        setErrorAlert({ show: true, message: errorMessage, type: errorType });
      });
  }, [token]);

  useEffect(() => {
    if (!selectedCabecera) return; // No hacer la petición si no hay un ID seleccionado

    axios
      .get(
        `${process.env.REACT_APP_API_URL}Consolidar/ObtenerConteosConsolidado?idCabecera=${selectedCabecera}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        setDataTableData(response.data?.datos || []);
      })
      .catch((error) => {
        setErrorAlert({
          show: true,
          message: "Error al obtener los conteos consolidados.",
          type: "error",
        });
      });
  }, [selectedCabecera, token]);

  //Funcion para que cuando el campo viene vacio muestre N/A
  const displayValue = (value) => (value ? value : "N/A");

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="cabecera-select-label">Cabecera</InputLabel>
              <Select
                labelId="cabecera-select-label"
                value={selectedCabecera}
                onChange={(e) => setSelectedCabecera(e.target.value)}
                label="Cabecera"
                style={{ height: "2.5rem", backgroundColor: "white" }}
              >
                {cabeceras.length > 0 ? (
                  cabeceras.map((cabecera) => (
                    <MenuItem key={cabecera.idCabecera} value={cabecera.idCabecera}>
                      {cabecera.leyendaTipoLiqReporte}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay opciones disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {dataTableData.length > 0 && (
          <MDBox my={3}>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "ID Establecimiento", accessor: "idEstablecimiento" },
                    { Header: "Consolidado S", accessor: "countConsolidadoS" },
                    { Header: "Consolidado N", accessor: "countConsolidadoN" },
                    {
                      Header: "Acción",
                      accessor: "edit",
                      Cell: ({ row }) => (
                        <MDButton
                          variant="gradient"
                          color="info"
                          onClick={() => console.log("Más Info:", row.original)}
                        >
                          Más Info
                        </MDButton>
                      ),
                    },
                  ],
                  rows: dataTableData,
                }}
                entriesPerPage={false}
                canSearch
                show
              />
            </Card>
          </MDBox>
        )}
      </DashboardLayout>
    </>
  );
}

ConsolidarMecPOF.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default ConsolidarMecPOF;
