import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ModalAgregarPOF from "./ModalAgregarPOF";
import ModalAgregarPersona from "./ModalAgregarPersona";

export default function ProcesarArchivoImportado() {
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorButton, setShowErrorButton] = useState(false);
  const [erroresMec, setErroresMec] = useState([]);
  const [isLoadingErrores, setIsLoadingErrores] = useState(false);
  const [showAgregarPOFModal, setShowAgregarPOFModal] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [showAgregarPersonaModal, setShowAgregarPersonaModal] = useState(false);
  const [personaDataForModal, setPersonaDataForModal] = useState(null);
  const [showProcesarDefinitivo, setShowProcesarDefinitivo] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "CabeceraLiquidacion/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const filteredCabeceras = response.data.filter((item) => item.estado === "I");
        const formattedCabeceras = filteredCabeceras.map((item) => ({
          id: item.idCabecera,
          displayText: `${item.tipoLiquidacion.descripcion} - ${item.mesLiquidacion}/${item.anioLiquidacion}`,
        }));
        setIdCabeceras(formattedCabeceras);
      })
      .catch(() => {
        setErrorAlert({
          show: true,
          message: "Error al cargar las cabeceras.",
          type: "error",
        });
      });
  }, [token]);

  const fetchErroresMec = async () => {
    setIsLoadingErrores(true);
    try {
      const url = process.env.REACT_APP_API_URL + "TMPErrores/GetErroresMec";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const permitidos = new Set(["NE", "NP"]);
      const filtrados = (response.data || []).filter((r) =>
        permitidos.has(
          String(r?.estado ?? "")
            .trim()
            .toUpperCase()
        )
      );

      setErroresMec(filtrados);
    } catch (error) {
      setErrorAlert({
        show: true,
        message: "No se pudieron obtener los errores.",
        type: "error",
      });
    } finally {
      setIsLoadingErrores(false);
    }
  };
  const handleProcessFile = async () => {
    if (!selectedIdCabecera) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona una cabecera antes de continuar.",
        type: "error",
      });
      return;
    }

    setIsProcessing(true);
    setShowErrorButton(false);
    setShowProcesarDefinitivo(false);

    try {
      const url =
        process.env.REACT_APP_API_URL +
        `ImportarMecanizadas/PreprocesarArchivo?idCabecera=${selectedIdCabecera}`;

      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      setErrorAlert({
        show: true,
        message: "Archivo preprocesado exitosamente.",
        type: "success",
      });
      setTimeout(() => setErrorAlert((prev) => ({ ...prev, show: false })), 3000);
      setShowProcesarDefinitivo(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "Error inesperado al procesar el archivo.";

      setErrorAlert({ show: true, message: errorMessage, type: "error" });
      setTimeout(() => setErrorAlert((prev) => ({ ...prev, show: false })), 5000);

      if (error.response?.status >= 400) {
        setShowErrorButton(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const handleProcesarDefinitivo = async () => {
    try {
      const url =
        process.env.REACT_APP_API_URL +
        `ImportarMecanizadas/Procesar?idCabecera=${selectedIdCabecera}`;

      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      setErrorAlert({
        show: true,
        message: "Archivo procesado definitivamente.",
        type: "success",
      });
    } catch (error) {
      const backendMessage = error.response?.data || "Error procesando definitivamente el archivo.";
      setErrorAlert({
        show: true,
        message: backendMessage,
        type: "error",
      });
      setTimeout(() => setErrorAlert((prev) => ({ ...prev, show: false })), 5000);
    }
  };

  const handleViewErrors = () => {
    fetchErroresMec();
  };

  const handleGuardarPOF = async (dataGuardada) => {
    setShowAgregarPOFModal(false);
    setPersonaSeleccionada(null);

    setErrorAlert({
      show: true,
      message: dataGuardada?.mensaje || "POF guardado correctamente",
      type: "success",
    });

    await fetchErroresMec();
  };

  const handleAgregarPOF = (persona) => {
    setPersonaSeleccionada(persona);
    setShowAgregarPOFModal(true);
  };

  const handleClosePOFModal = () => {
    setShowAgregarPOFModal(false);
    setPersonaSeleccionada(null);
  };

  const handleOpenAgregarPersonaModal = (persona) => {
    setPersonaDataForModal({
      legajo: persona?.legajoEFI || persona?.legajoMEC || "",
      dni: persona?.documento || "",
      apellido: persona?.apellido || "",
      nombre: persona?.nombre || "",
    });
    setShowAgregarPersonaModal(true);
  };

  const handleSavePersona = async (dataGuardada) => {
    setShowAgregarPersonaModal(false);
    setPersonaDataForModal(null);
    setErrorAlert({
      show: true,
      message: dataGuardada?.mensaje || "Persona guardada correctamente",
      type: "success",
    });
    await fetchErroresMec();
  };

  const AccionesCellPropTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        estado: PropTypes.string.isRequired,
        legajo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        documento: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        apellido: PropTypes.string,
        nombre: PropTypes.string,
      }).isRequired,
    }).isRequired,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container spacing={2} mt={1}>
        <Grid item xs={5}>
          <FormControl fullWidth>
            <InputLabel id="filter-label">Seleccionar Cabecera</InputLabel>
            <Select
              labelId="filter-label"
              label="Seleccionar Cabecera"
              value={selectedIdCabecera}
              style={{ height: "2.7rem", backgroundColor: "white" }}
              onChange={(e) => {
                setSelectedIdCabecera(e.target.value);
                setShowErrorButton(false);
                setErroresMec([]);
                setShowProcesarDefinitivo(false);
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

        <Grid item xs={5}>
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleProcessFile}
            endIcon={<DeleteOutlineIcon />}
            disabled={isProcessing}
          >
            Procesar archivo importado
          </MDButton>
        </Grid>
      </Grid>

      {errorAlert.show && (
        <Grid container justifyContent="center">
          <Grid item xs={12}>
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
      {showProcesarDefinitivo && (
        <Grid container justifyContent="center" mt={2}>
          <MDButton variant="gradient" color="success" onClick={handleProcesarDefinitivo}>
            Finalizar Proceso
          </MDButton>
        </Grid>
      )}

      {showErrorButton && (
        <Grid container justifyContent="center" mt={3}>
          <MDButton size="small" variant="gradient" color="error" onClick={handleViewErrors}>
            Ver errores
          </MDButton>
        </Grid>
      )}

      {isProcessing && (
        <Grid container direction="column" alignItems="center" justifyContent="center" mt={7}>
          <CircularProgress color="info" />
          <span style={{ fontSize: "1.2rem", fontWeight: 500, color: "#333" }}>
            Procesando archivo importado...
          </span>
        </Grid>
      )}

      {isLoadingErrores ? (
        <Grid container justifyContent="center" mt={4}>
          <CircularProgress color="info" />
        </Grid>
      ) : (
        erroresMec.length > 0 && (
          <MDBox my={3}>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "Legajo EFI", accessor: "legajoEFI" },
                    { Header: "Legajo MEC", accessor: "legajoMEC" },
                    { Header: "Documento", accessor: "documento" },
                    { Header: "Apellido", accessor: "apellido" },
                    { Header: "Nombre", accessor: "nombre" },
                    {
                      Header: "Acciones",
                      accessor: "acciones",
                      Cell: function AccionesCell({ row }) {
                        const estado = String(row.original.estado || "")
                          .trim()
                          .toUpperCase();
                        return (
                          <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
                            {estado === "NE" && (
                              <MDButton
                                variant="gradient"
                                color="warning"
                                size="small"
                                onClick={() => handleOpenAgregarPersonaModal(row.original)}
                              >
                                Agregar persona
                              </MDButton>
                            )}
                            {estado === "NP" && (
                              <MDButton
                                variant="gradient"
                                color="success"
                                size="small"
                                onClick={() => handleAgregarPOF(row.original)}
                              >
                                Agregar POF
                              </MDButton>
                            )}
                          </MDBox>
                        );
                      },
                      propTypes: AccionesCellPropTypes,
                    },
                  ],
                  rows: erroresMec,
                }}
                entriesPerPage={false}
                canSearch
                show
              />
            </Card>
          </MDBox>
        )
      )}

      <ModalAgregarPOF
        open={showAgregarPOFModal}
        onClose={handleClosePOFModal}
        persona={personaSeleccionada}
        onSave={handleGuardarPOF}
      />

      <ModalAgregarPersona
        open={showAgregarPersonaModal}
        onClose={() => setShowAgregarPersonaModal(false)}
        personaData={personaDataForModal}
        onSave={handleSavePersona}
        token={token}
        setErrorAlert={setErrorAlert}
        fetchErroresMec={fetchErroresMec}
      />
    </DashboardLayout>
  );
}
