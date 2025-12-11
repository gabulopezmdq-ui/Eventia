import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
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
import HaberesPDF from "./HaberesPDF";
function ConsolidarMecPOF() {
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [errorAlertDelete, setErrorAlertDelete] = useState({
    show: false,
    message: "",
    type: "error",
  });
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedCabecera, setSelectedCabecera] = useState("");
  const [nombreEstablecimiento, setNombreEstablecimiento] = useState("");
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
  const [loadingConsolidar, setLoadingConsolidar] = useState(false);
  const [selectedCabeceraData, setSelectedCabeceraData] = useState(null);
  const [reporteData, setReporteData] = useState({});
  const [haberesButtonState, setHaberesButtonState] = useState({});
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "CabeceraLiquidacion/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const filteredCabeceras = response.data.filter((item) => item.estado === "R") || [];
        const formattedCabeceras = filteredCabeceras.map((item) => ({
          id: item.idCabecera,
          displayText: `${item.tipoLiquidacion.descripcion} - ${item.mesLiquidacion}/${item.anioLiquidacion}`,
          anioLiquidacion: item.anioLiquidacion,
          mesLiquidacion: item.mesLiquidacion,
        }));
        setIdCabeceras(formattedCabeceras);
      })
      .catch((error) => {
        setErrorAlert({ show: true, message: "Error al cargar las cabeceras.", type: "error" });
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
  //Boton de consolidar tabla MEC
  const handleButtonClick = (row) => {
    setNombreEstablecimiento(row.nroEstablecimiento);
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
        const dataWithFullName = (response.data || [])
          .sort((a, b) => a.dni - b.dni)
          .map((item) => ({
            ...item,
            nombreCompleto: `${item.apellido} ${item.nombre}`,
          }));
        setMecData(dataWithFullName);
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
        const sortResponse = (response.data || [])
          .sort((a, b) => a.personaDNI - b.personaDNI)
          .map((item) => ({
            ...item,
            nombreCompleto: `${item.personaApellido} ${item.personaNombre}`,
          }));
        setDocentesData(sortResponse);
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
        const dataWithFullName = (response.data || []).map((item) => ({
          ...item,
          nombreCompleto: `${item.apellido} ${item.nombre} `,
        }));
        setSuplentesData(dataWithFullName);
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
      .delete(`${process.env.REACT_APP_API_URL}Consolidar/EliminarMEC?IdMecanizada=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMecData((prevData) => prevData.filter((item) => item.idMecanizada !== id));
        setErrorAlertDelete({ show: true, message: "Registro eliminado.", type: "success" });
        setTimeout(() => {
          setErrorAlertDelete({ show: false, message: "", type: "" });
        }, 3000);
      })
      .catch(() => {
        setErrorAlertDelete({ show: true, message: "Error al eliminar registro.", type: "error" });
      });
  };

  const handleChangeStatus = () => {
    if (!selectedCabecera) return;
    axios
      .post(
        `${process.env.REACT_APP_API_URL}Consolidar/CambiarEstado?idCabecera=${selectedCabecera}`,
        {
          idCabecera: selectedCabecera,
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
  const handleCabeceraChange = (e) => {
    const cabeceraId = e.target.value;
    setSelectedCabecera(cabeceraId);
    const cabeceraSeleccionada = idCabeceras.find((item) => item.id === cabeceraId);
    setSelectedCabeceraData(cabeceraSeleccionada);
  };
  const handlePopUP = (suplente) => {
    setSuplenteSeleccionado(suplente);
    setOpenPopup(true);
  };

  const handleSubmit = async (data) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}Consolidar/POFDetalle`;
      const response = await axios.put(url, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSuplentesData(selectedIdEstablecimiento);

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
      const dataWithFullName = (response.data || []).map((item) => ({
        ...item,
        nombreCompleto: `${item.apellido} ${item.nombre} `,
      }));
      setSuplentesData(dataWithFullName);
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
  const handleOpenMecPopup = (docente) => {
    setSelectedDocente(docente);
    setOpenMecPopup(true);
  };

  const handleCloseMecPopup = () => {
    setOpenMecPopup(false);
  };

  const handleSubmitMec = async (formData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}Consolidar/ProcesarAltaMecanizada`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Respuesta del backend:", response.data);

      setLoadingDocentes(true);
      setLoadingMec(true);
      const docentesResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}Consolidar/ObtenerRegistrosPOFNoMecanizados?idCabecera=${selectedCabecera}&idEstablecimiento=${formData.idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sortedData = (docentesResponse.data || [])
        .sort((a, b) => a.personaDNI - b.personaDNI)
        .map((item) => ({
          ...item,
          nombreCompleto: `${item.personaApellido} ${item.personaNombre}`,
        }));

      setDocentesData(sortedData);
      const mecResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}Consolidar/Mecanizadas?idCabecera=${selectedCabecera}&idEstablecimiento=${formData.idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedMecData = (mecResponse.data || [])
        .sort((a, b) => a.dni - b.dni)
        .map((item) => ({
          ...item,
          nombreCompleto: `${item.apellido} ${item.nombre}`,
        }));
      setMecData(updatedMecData);
    } catch (error) {
      console.error("Error al enviar datos:", error);
      setErrorAlert({
        show: true,
        message: error.response?.data?.message || "Error al procesar la operación",
        type: "error",
      });
      throw error;
    } finally {
      setLoadingDocentes(false);
      setLoadingMec(false);
    }
  };
  const shouldHideTables = allCountsZero;

  const handleConsolidarFinal = async () => {
    if (!selectedCabecera || !selectedIdEstablecimiento) return;

    setLoadingConsolidar(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}Consolidar/Consolidar`,
        null,
        {
          params: {
            idCabecera: selectedCabecera,
            idEstablecimiento: selectedIdEstablecimiento,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Consolidación exitosa:", response.data);
      setErrorAlert({
        show: true,
        message: "Consolidación realizada correctamente.",
        type: "success",
      });
      const conteosResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}Consolidar/ObtenerConteosConsolidado?idCabecera=${selectedCabecera}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = Array.isArray(conteosResponse.data.datos)
        ? conteosResponse.data.datos
        : [conteosResponse.data.datos];

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
      setMecData([]);
      setDocentesData([]);
      setSuplentesData([]);
      setNombreEstablecimiento("");
      setSelectedIdEstablecimiento(null);
    } catch (error) {
      console.error("Error al consolidar:", error);
      setErrorAlert({
        show: true,
        message: "Error al consolidar.",
        type: "error",
      });
    } finally {
      setLoadingConsolidar(false);
    }
  };

  const handleHaberesClick = async (row) => {
    const { idEstablecimiento } = row;
    setHaberesButtonState((prev) => ({ ...prev, [idEstablecimiento]: "loading" }));

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}Consolidar/reporte?idCabecera=${selectedCabecera}&idEstablecimiento=${idEstablecimiento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReporteData((prev) => ({ ...prev, [idEstablecimiento]: response.data }));
      setHaberesButtonState((prev) => ({ ...prev, [idEstablecimiento]: "finished" }));
    } catch (error) {
      console.error("Error al generar el reporte de haberes:", error);
      setErrorAlert({
        show: true,
        message: "Error al generar el reporte de haberes.",
        type: "error",
      });
      setHaberesButtonState((prev) => ({ ...prev, [idEstablecimiento]: "initial" }));
    }
  };

  const handleVerReporteClick = async (row) => {
    const { idEstablecimiento } = row;
    const dataParaReporte = reporteData[idEstablecimiento];

    // Obtener cabecera seleccionada
    const cabeceraSeleccionada = idCabeceras.find((c) => c.id === selectedCabecera);

    if (Array.isArray(dataParaReporte) && dataParaReporte.length > 0) {
      const primerRegistro = dataParaReporte[0];

      const docenteConOrdenPago = dataParaReporte.find(
        (d) => d.ordenPago !== undefined && d.ordenPago !== null
      );

      const reporteParseado = {
        establecimiento: {
          nombrePcia: primerRegistro.nombrePcia,
          nroDiegep: primerRegistro.nroDiegep,
          subvencion: primerRegistro.subvencion,
          cantTurnos: primerRegistro.cantTurnos,
          cantSecciones: primerRegistro.cantSecciones,
          ruralidad: primerRegistro.ruralidad,
          tipoEst: primerRegistro.tipoEst,
          tipoEstDesc: primerRegistro.tipoEstDesc,
          ordenPago: docenteConOrdenPago ? docenteConOrdenPago.ordenPago : null,
          anioLiquidacion: cabeceraSeleccionada?.anioLiquidacion || null,
          mesLiquidacion: cabeceraSeleccionada?.mesLiquidacion || null,
        },
        docentes: dataParaReporte,
      };

      console.log(
        `Datos parseados para el reporte del establecimiento ${idEstablecimiento}:`,
        reporteParseado
      );

      await HaberesPDF(reporteParseado);
    } else {
      console.error(
        "No se encontraron datos para el reporte del establecimiento:",
        idEstablecimiento
      );
    }
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
              <InputLabel id="cabecera-select-label">Seleccione Cabecera</InputLabel>
              <Select
                labelId="filter-label"
                label="Seleccione Cabecera"
                value={selectedCabecera}
                onChange={(e) => setSelectedCabecera(e.target.value)}
                style={{ height: "2.5rem", backgroundColor: "white" }}
              >
                {idCabeceras.map((item, index) => (
                  <MenuItem key={index} value={item.id}>
                    {item.displayText}
                  </MenuItem>
                ))}
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
                        const { countConsolidadoN, countConsolidadoS } = row.original;
                        const buttonState =
                          haberesButtonState[row.original.idEstablecimiento] || "initial";
                        return (
                          <>
                            {countConsolidadoN > 0 && (
                              <MDButton
                                size="small"
                                color="info"
                                variant="gradient"
                                onClick={() => handleButtonClick(row.original)}
                                sx={{ mr: 1 }}
                              >
                                Consolidar
                              </MDButton>
                            )}
                            {countConsolidadoS > 0 && (
                              <MDButton
                                size="small"
                                color="secondary"
                                variant="gradient"
                                onClick={() =>
                                  buttonState === "finished"
                                    ? handleVerReporteClick(row.original)
                                    : handleHaberesClick(row.original)
                                }
                                disabled={buttonState === "loading"}
                              >
                                {buttonState === "loading" ? (
                                  <>
                                    <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                                    Procesando...
                                  </>
                                ) : buttonState === "finished" ? (
                                  "Ver Reporte"
                                ) : (
                                  "Haberes"
                                )}
                              </MDButton>
                            )}
                          </>
                        );
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
        {nombreEstablecimiento && dataTableData.length > 0 && (
          <MDAlert className="custom-alert" sx={{ color: "#b1d1eea6" }}>
            <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
            <MDTypography ml={1} variant="button">
              Establecimiento {nombreEstablecimiento}
            </MDTypography>
          </MDAlert>
        )}
        {(loadingMec || loadingDocentes || loadingSuplentes) && (
          <MDBox display="flex" justifyContent="center" my={3}>
            <CircularProgress color="info" />
          </MDBox>
        )}
        {!shouldHideTables && (
          <>
            {mecData.length > 0 && !loadingMec && (
              <MDBox my={3}>
                <MDAlert className="custom-alert">
                  <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
                  <MDTypography ml={1} variant="button">
                    MEC
                  </MDTypography>
                </MDAlert>
                {errorAlertDelete.show && (
                  <Grid container justifyContent="center">
                    <Grid item xs={12} lg={12}>
                      <MDBox pt={2}>
                        <MDAlert color={errorAlertDelete.type} dismissible>
                          <MDTypography variant="body2" color="white">
                            {errorAlertDelete.message}
                          </MDTypography>
                        </MDAlert>
                      </MDBox>
                    </Grid>
                  </Grid>
                )}
                <Card>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Nombre Completo", accessor: "nombreCompleto" },
                        {
                          Header: "Documento",
                          accessor: "dni",
                          Cell: ({ row }) => row.original?.dni || "N/A",
                        },
                        { Header: "Secuencia", accessor: "secuencia" },
                        { Header: "Tipo Cargo", accessor: "tipoCargo" },
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
                              onClick={() => handleDelete(row.original.idMecanizada)}
                              disabled={row.original.origen !== "POF"}
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
                        { Header: "Nombre Completo", accessor: "nombreCompleto" },
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
                        {
                          Header: "Documento",
                          accessor: "dni",
                          Cell: ({ row }) => row.original?.dni || "N/A",
                        },
                        { Header: "Nombre Completo", accessor: "nombreCompleto" },
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
          </>
        )}
        {nombreEstablecimiento && dataTableData.length > 0 && (
          <MDButton
            size="small"
            color="info"
            variant="gradient"
            onClick={handleConsolidarFinal}
            disabled={loadingConsolidar}
          >
            {loadingConsolidar ? (
              <>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                Consolidando...
              </>
            ) : (
              "Finalizar Consolidacion"
            )}
          </MDButton>
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
          anioLiquidacion={idCabeceras.find((c) => c.id === selectedCabecera)?.anioLiquidacion}
          mesLiquidacion={idCabeceras.find((c) => c.id === selectedCabecera)?.mesLiquidacion}
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
