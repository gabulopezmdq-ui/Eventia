import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MDAlert from "components/MDAlert";
import CircularProgress from "@mui/material/CircularProgress";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import DataTable from "examples/Tables/DataTable";
import SupleAPopup from "./SupleAPopUp";
import MecPopup from "./MecPopUp";
function ConsolidarMecPOF() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [cabeceras, setCabeceras] = useState([]);
  const [selectedCabecera, setSelectedCabecera] = useState("");
  const [dataTableData, setDataTableData] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [mecData, setMecData] = useState([]);
  const [docentesData, setDocentesData] = useState([]);
  const [suplentesData, setSuplentesData] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [suplenteSeleccionado, setSuplenteSeleccionado] = useState(null);
  const [openMecPopup, setOpenMecPopup] = useState(false);
  const [selectedIdEstablecimiento, setSelectedIdEstablecimiento] = useState(null);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [loadingMec, setLoadingMec] = useState(false);
  const [loadingDocentes, setLoadingDocentes] = useState(false);
  const [loadingSuplentes, setLoadingSuplentes] = useState(false);
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
    setSelectedIdEstablecimiento(row.idEstablecimiento);
    setMecData([]);
    setDocentesData([]);
    setSuplentesData([]);
    setLoadingMec(true);
    setLoadingDocentes(true);
    setLoadingSuplentes(true);
    axios
      .get(
        /*Endpoint TABLA MEC */
        `${process.env.REACT_APP_API_URL}Consolidar/Mecanizadas?idCabecera=${selectedCabecera}&idEstablecimiento=${row.idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setMecData(response.data || []);
        setLoadingMec(false);
      })
      .catch(() => {
        setErrorAlert({ show: true, message: "Error al obtener datos de MEC.", type: "error" });
      })
      .finally(() => setLoadingMec(false));
    /*Endpoint TABLA Docentes POF sin Haberes ni Subvenciones */
    axios
      .get(
        `${process.env.REACT_APP_API_URL}Consolidar/ObtenerRegistrosPOFNoMecanizados?idCabecera=${selectedCabecera}&idEstablecimiento=${row.idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setDocentesData(response.data || []);
        setLoadingDocentes(false);
      })
      .catch(() => {
        setErrorAlert({
          show: true,
          message: "Error al obtener los datos de Docentes.",
          type: "error",
        });
      })
      .finally(() => setLoadingDocentes(false));
    /*Endpoint TABLA Suplentes */
    axios
      .get(
        `${process.env.REACT_APP_API_URL}Consolidar/Suplentes?idCabecera=${selectedCabecera}&idEstablecimiento=${row.idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setSuplentesData(response.data || []);
        setLoadingSuplentes(false);
      })
      .catch(() => {
        setErrorAlert({
          show: true,
          message: "Error al obtener los datos de Docentes Suplentes.",
          type: "error",
        });
      })
      .finally(() => setLoadingSuplentes(false));
  };
  // Boton delete de la tabla MEC
  const handleDelete = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}EliminarMEC/Delete?idMecanizada=${id}`, {
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
    /*const today = new Date();
    const formattedDate =
      today.getFullYear() +
      "/" +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      today.getDate().toString().padStart(2, "0");*/
    axios
      .put(
        `${process.env.REACT_APP_API_URL}Consolidar/HabilitarCambiarEstadoCabecera`,
        {
          idCabecera: selectedCabecera,
          /*fechaCambioEstado: formattedDate,*/
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

  const handlePopUP = (suplente) => {
    setSuplenteSeleccionado(suplente);
    setOpenPopup(true);
  };

  const handleSubmit = async (data) => {
    try {
      const url = suplenteSeleccionado.pof.pofDetalle?.[0]
        ? `${process.env.REACT_APP_API_URL}Consolidar/POFDetalle`
        : `${process.env.REACT_APP_API_URL}Consolidar/POFDetalle`;

      const response = await axios.put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSuplentesData(selectedIdEstablecimiento);

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error en la operación";
      throw new Error(errorMessage);
    }
  };

  const fetchSuplentesData = async (idEstablecimiento) => {
    setLoadingSuplentes(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}Consolidar/Suplentes?idCabecera=${selectedCabecera}&idEstablecimiento=${idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuplentesData(response.data || []);
    } catch (error) {
      setErrorAlert({
        show: true,
        message: "Error al obtener los datos de Docentes Suplentes.",
        type: "error",
      });
    } finally {
      setLoadingSuplentes(false);
    }
  };
  //POPUP MEC
  const handleOpenMecPopup = (docente) => {
    setSelectedDocente(docente);
    setOpenMecPopup(true);
  };

  const handleCloseMecPopup = () => {
    setOpenMecPopup(false);
  };

  const handleSubmitMec = async (formData) => {
    try {
      const response = await axios.post("consolidar/MECPOF", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Respuesta del backend:", response.data);

      setLoadingDocentes(true);
      const docentesResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}Consolidar/ObtenerRegistrosPOFNoMecanizados?idCabecera=${selectedCabecera}&idEstablecimiento=${formData.idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDocentesData(docentesResponse.data || []);
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setErrorAlert({
        show: true,
        message: "Error al enviar datos o actualizar docentes.",
        type: "error",
      });
      throw error;
    } finally {
      setLoadingDocentes(false);
    }
  };
  const formatISODate = (isoString) => {
    if (!isoString) return "N/A";
    const [fecha] = isoString.split("T");
    const [anio, mes, dia] = fecha.split("-");
    return `${anio}/${mes}/${dia}`;
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
        {selectedCabecera && dataTableData.length > 0 ? (
          <MDBox my={3}>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "ID Establecimiento", accessor: "nroEstablecimiento" },
                    { Header: "Consolidado S", accessor: "countConsolidadoS" },
                    { Header: "Consolidado N", accessor: "countConsolidadoN" },
                    {
                      Header: "Acción",
                      accessor: "accion",
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
          selectedCabecera &&
          dataTableData.length === 0 && <p>No hay datos disponibles para mostrar</p>
        )}
        {selectedCabecera && allCountsZero && (
          <MDBox my={3} display="flex" justifyContent="center">
            <MDButton size="small" color="info" variant="gradient" onClick={handleChangeStatus}>
              Cambiar Estado
            </MDButton>
          </MDBox>
        )}
        {(loadingMec || loadingDocentes || loadingSuplentes) && (
          <MDBox display="flex" justifyContent="center" my={3}>
            <CircularProgress color="info" />
          </MDBox>
        )}
        {mecData.length > 0 && !loadingMec && (
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
                    {
                      Header: "Nombre Completo",
                      accessor: "nombreCompleto",
                      Cell: ({ row }) =>
                        `${row.original.pof?.persona?.nombre} ${row.original.pof?.persona?.apellido}`,
                    },
                    { Header: "Documento", accessor: "pof.persona.dni" },
                    { Header: "Secuencia", accessor: "pof.secuencia" },
                    { Header: "Tipo Cargo", accessor: "pof.tipoCargo" },
                    { Header: "Año/Mes Afec", accessor: "anioMesAfectacion" },
                    { Header: "CodLiq", accessor: "codigoLiquidacion" },
                    { Header: "Origen", accessor: "origen" },
                    {
                      Header: "Acción",
                      accessor: "accion",
                      Cell: ({ row }) => (
                        <MDButton
                          size="small"
                          color="error"
                          variant="gradient"
                          onClick={() => handleDelete(row.original.id)}
                          disabled={row.original.mecanizadaOrigen !== "POF"}
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
        {docentesData.length > 0 && !loadingDocentes && (
          <MDBox my={3}>
            <MDAlert className="custom-alert">
              <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
              <MDTypography ml={1} variant="button">
                Docentes POF sin haberes ni subvenciones
              </MDTypography>
            </MDAlert>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "Documento", accessor: "personaDNI" },
                    {
                      Header: "Nombre Completo",
                      accessor: "nombreCompleto",
                      Cell: ({ row }) =>
                        `${row.original.personaNombre} ${row.original.personaApellido}`,
                    },
                    { Header: "Secuencia", accessor: "secuencia" },
                    { Header: "Car. Revista", accessor: "carRevista" },
                    { Header: "Cargo", accessor: "cargo" },
                    { Header: "Horas", accessor: "cantHorasCS" },
                    {
                      Header: "Sin Haberes",
                      accessor: "sinHaberes",
                      Cell: ({ value }) => (value === null ? "N/A" : value),
                    },
                    {
                      Header: "No Subvencionadas",
                      accessor: "noSubvencionado",
                      Cell: ({ value }) => (value === null ? "N/A" : value),
                    },
                    {
                      Header: "Acción",
                      accessor: "accion",
                      Cell: ({ row }) => (
                        <MDButton
                          size="small"
                          color="success"
                          variant="gradient"
                          onClick={() => handleOpenMecPopup(row.original)}
                        >
                          Agregar MEC
                        </MDButton>
                      ),
                    },
                  ],
                  rows: docentesData,
                }}
                entriesPerPage={false}
                canSearch
                show
              />
            </Card>
          </MDBox>
        )}
        {suplentesData.length > 0 && !loadingSuplentes && (
          <MDBox my={3}>
            <MDAlert className="custom-alert">
              <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
              <MDTypography ml={1} variant="button">
                Docentes Suplentes
              </MDTypography>
            </MDAlert>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "Documento", accessor: "pof.persona.dni" },
                    {
                      Header: "Nombre Completo",
                      accessor: "nombreCompleto",
                      Cell: ({ row }) =>
                        `${row.original.pof.persona.nombre} ${row.original.pof.persona.apellido}`,
                    },
                    {
                      Header: "Suple A",
                      accessor: "",
                      Cell: ({ row }) =>
                        `${row.original.pof.pofDetalle?.[0]?.suplencia?.persona?.nombre || ""} 
                         ${row.original.pof.pofDetalle?.[0]?.suplencia?.persona?.apellido || ""}`,
                    },
                    {
                      Header: "Desde",
                      accessor: "desde",
                      Cell: ({ row }) =>
                        formatISODate(row.original.pof.pofDetalle?.[0]?.supleDesde),
                    },
                    {
                      Header: "Hasta",
                      accessor: "hasta",
                      Cell: ({ row }) =>
                        formatISODate(row.original.pof.pofDetalle?.[0]?.supleHasta),
                    },
                    {
                      Header: "Acción",
                      accessor: "accion",
                      Cell: ({ row }) => (
                        <MDButton
                          size="small"
                          color="warning"
                          variant="gradient"
                          onClick={() => handlePopUP(row.original)}
                        >
                          Suple A
                        </MDButton>
                      ),
                    },
                  ],
                  rows: suplentesData,
                }}
                entriesPerPage={false}
                canSearch
                show
              />
            </Card>
          </MDBox>
        )}
        <SupleAPopup
          open={openPopup}
          handleClose={() => setOpenPopup(false)}
          suplente={suplenteSeleccionado}
          idEstablecimiento={selectedIdEstablecimiento}
          onSubmit={handleSubmit}
        />
        <MecPopup
          open={openMecPopup}
          handleClose={handleCloseMecPopup}
          docente={selectedDocente}
          onSubmit={handleSubmitMec}
          idCabecera={selectedCabecera}
          tieneAntiguedad={selectedDocente?.tieneAntiguedad ?? false}
        />
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
