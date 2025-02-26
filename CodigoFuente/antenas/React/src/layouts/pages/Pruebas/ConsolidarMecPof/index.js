import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
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
  const [establecimientos, setEstablecimientos] = useState([]);
  const [mecData, setMecData] = useState([]);
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
    axios
      .get(`${process.env.REACT_APP_API_URL}Establecimientos/GetAll`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setEstablecimientos(response.data || []);
      })
      .catch((error) => {
        setErrorAlert({
          show: true,
          message: "Error al obtener los establecimientos.",
          type: "error",
        });
      });
  }, [token]);

  useEffect(() => {
    if (!selectedCabecera) return;
    axios
      .get(
        `${process.env.REACT_APP_API_URL}Consolidar/ObtenerConteosConsolidado?idCabecera=${selectedCabecera}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => {
        const data = Array.isArray(response.data.datos)
          ? response.data.datos
          : [response.data.datos];
        const enrichedData = data.map((item) => {
          const establecimiento = establecimientos.find(
            (e) => e.idEstablecimiento === item.idEstablecimiento
          );
          return {
            ...item,
            nroEstablecimiento: establecimiento ? establecimiento.nroEstablecimiento : "N/A",
          };
        });

        setDataTableData(enrichedData);
      })
      .catch((error) => {
        setErrorAlert({
          show: true,
          message: "Error al obtener los conteos consolidados.",
          type: "error",
        });
      });
  }, [selectedCabecera, token, establecimientos]);

  const allCountsZero = dataTableData.every((row) => row.countConsolidadoN === 0);

  const displayValue = (value) => (value ? value : "N/A");

  //Boton de consolidar tabla MEC
  const handleButtonClick = (row) => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}Consolidar/ObtenerRegistrosPOFNoMecanizados?idCabecera=${selectedCabecera}&idEstablecimiento=${row.idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setMecData(response.data || []);
      })
      .catch(() => {
        setErrorAlert({ show: true, message: "Error al obtener datos de MED.", type: "error" });
      });
  };
  // Boton delete de la tabla MEC
  const handleDelete = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}MED/Delete?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMecData((prevData) => prevData.filter((item) => item.id !== id));
        setErrorAlert({ show: true, message: "Registro eliminado.", type: "success" });
      })
      .catch(() => {
        setErrorAlert({ show: true, message: "Error al eliminar registro.", type: "error" });
      });
  };

  const handleChangeStatus = () => {
    if (!selectedCabecera) return;
    const today = new Date();
    const formattedDate =
      today.getFullYear() +
      "/" +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      today.getDate().toString().padStart(2, "0");
    axios
      .put(
        `${process.env.REACT_APP_API_URL}Consolidar/HabilitarCambiarEstadoCabecera`,
        {
          idCabecera: selectedCabecera,
          fechaCambioEstado: formattedDate,
          estado: "S",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setErrorAlert({
          show: true,
          message: "Estado cambiado exitosamente.",
          type: "success",
        });
      })
      .catch((error) => {
        let errorMessage = "Ocurrió un error al cambiar el estado.";
        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema con la solicitud del cliente.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema en el servidor.`;
          }
        }
        setErrorAlert({ show: true, message: errorMessage, type: "error" });
      });
  };

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
        {dataTableData.length > 0 ? (
          <MDBox my={3}>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "ID Establecimiento", accessor: "nroEstablecimiento" }, // Mostrar nroEstablecimiento
                    { Header: "Consolidado S", accessor: "countConsolidadoS" },
                    { Header: "Consolidado N", accessor: "countConsolidadoN" },
                    {
                      Header: "Acción",
                      accessor: "accion", // Aquí agregas una columna para el botón
                      Cell: ({ row }) => {
                        const countConsolidadoN = row.original.countConsolidadoN;
                        if (countConsolidadoN > 0) {
                          return (
                            <MDButton
                              size="small"
                              color="info"
                              variant="gradient"
                              onClick={() => handleButtonClick(row.original)}
                            >
                              Consolidar
                            </MDButton>
                          );
                        }
                        return null;
                      },
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
        ) : (
          <p>No hay datos disponibles para mostrar</p>
        )}
        {allCountsZero && (
          <MDBox my={3} display="flex" justifyContent="center">
            <MDButton size="small" color="info" variant="gradient" onClick={handleChangeStatus}>
              Cambiar Estado
            </MDButton>
          </MDBox>
        )}
        {mecData.length > 0 && (
          <MDBox my={3}>
            <MDAlert className="custom-alert">
              <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
              <MDTypography ml={1} variant="button">
                MEC
              </MDTypography>
            </MDAlert>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "DNI", accessor: "persona.Apellido" },
                    { Header: "Secuencia", accessor: "secuencia" },
                    { Header: "Año", accessor: "anioAfeccion" },
                    { Header: "Mes", accessor: "mes" },
                    { Header: "CodLiq", accessor: "codLiq" },
                    {
                      Header: "Acción",
                      accessor: "accion",
                      Cell: ({ row }) =>
                        row.original.tipoOrigen === "POF" && (
                          <MDButton
                            size="small"
                            color="error"
                            variant="gradient"
                            onClick={() => handleDelete(row.original.id)}
                          >
                            Eliminar
                          </MDButton>
                        ),
                    },
                  ],
                  rows: mecData,
                }}
                entriesPerPage={false}
                canSearch
              />
            </Card>
          </MDBox>
        )}
      </DashboardLayout>
    </>
  );
}

ConsolidarMecPOF.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default ConsolidarMecPOF;
