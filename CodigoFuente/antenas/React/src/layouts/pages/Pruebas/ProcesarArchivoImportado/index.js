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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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

  // ⬇️ ADD: estado para modal "Agregar Persona"
  const [showAgregarPersonaModal, setShowAgregarPersonaModal] = useState(false);
  const [personaForm, setPersonaForm] = useState({
    legajo: "",
    dni: "",
    apellido: "",
    nombre: "",
    vigente: "S", // valor por defecto oculto
  });

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
      setErroresMec(response.data);
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
      console.error("Error al obtener errores:", error.response);
      setErrorAlert({
        show: true,
        message: "No se pudieron obtener los errores.",
        type: "error",
      });
      setTimeout(() => setErrorAlert({ show: false, message: "", type: "error" }), 5000);
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

    try {
      const url =
        process.env.REACT_APP_API_URL +
        `ImportarMecanizadas/PreprocesarArchivo?idCabecera=${selectedIdCabecera}`;

      await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

      setErrorAlert({
        show: true,
        message: "Archivo procesado exitosamente.",
        type: "success",
      });
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.mensaje ||
        errorData?.Message ||
        errorData?.error ||
        (typeof errorData === "string" ? errorData : null) ||
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

    // 🔁 Recargar la grilla de errores
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

  // ⬇️ ADD: abrir modal "Agregar Persona" con datos prellenados
  const handleAgregarPersona = (persona) => {
    setPersonaForm({
      legajo: persona?.legajo || "",
      dni: persona?.documento || "",
      apellido: persona?.apellido || "",
      nombre: persona?.nombre || "",
      vigente: "S", // si viene en la fila podés usar persona?.vigente ?? "S"
    });
    setShowAgregarPersonaModal(true);
  };

  // ⬇️ ADD: guardar persona -> POST Personas/EFIPersona y recargar grilla
  const handleGuardarPersona = async () => {
    const base = process.env.REACT_APP_API_URL || "";
    const url = new URL("Personas/EFIPersona", base).toString();

    // Normalizamos valores
    const Legajo = isNaN(Number(personaForm.legajo))
      ? personaForm.legajo
      : Number(personaForm.legajo);
    const DNI = String(personaForm.dni ?? "").trim();
    const Nombre = String(personaForm.nombre ?? "").trim();
    const Apellido = String(personaForm.apellido ?? "").trim();
    const Vigente = personaForm.vigente ?? "S";

    // Payload plano (lo que probablemente espera el backend, según el error)
    const flat = { Legajo, DNI, Apellido, Nombre, Vigente };

    try {
      console.log("POST (flat) =>", url, flat);
      const resp = await axios.post(url, flat, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("RESPUESTA (flat):", resp.status, resp.data);

      if (resp.status >= 200 && resp.status < 300) {
        setShowAgregarPersonaModal(false);
        setErrorAlert({
          show: true,
          message: resp.data?.mensaje || "Persona guardada correctamente",
          type: "success",
        });
        await fetchErroresMec();
        return;
      }

      // Si no fue 2xx, muestro error genérico
      setErrorAlert({
        show: true,
        message: resp.data?.mensaje || `Error (${resp.status}) al guardar la persona.`,
        type: "error",
      });
    } catch (e) {
      const status = e.response?.status;
      const data = e.response?.data;
      console.error("ERROR guardar persona (flat):", { status, data });

      // Si el server se queja de campos requeridos (DNI/Nombre), probamos con wrapper { Dto: ... }
      const hasValidationMissing =
        status === 400 &&
        data &&
        data.errors &&
        (data.errors.DNI || data.errors.Nombre || data.errors.Apellido || data.errors.Legajo);

      if (hasValidationMissing) {
        const wrapped = { Dto: flat };
        try {
          console.log("RETRY (wrapped Dto) =>", url, wrapped);
          const resp2 = await axios.post(url, wrapped, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("RESPUESTA (wrapped):", resp2.status, resp2.data);
          if (resp2.status >= 200 && resp2.status < 300) {
            setShowAgregarPersonaModal(false);
            setErrorAlert({
              show: true,
              message: resp2.data?.mensaje || "Persona guardada correctamente",
              type: "success",
            });
            await fetchErroresMec();
            return;
          }
          setErrorAlert({
            show: true,
            message: resp2.data?.mensaje || `Error (${resp2.status}) al guardar la persona.`,
            type: "error",
          });
          return;
        } catch (e2) {
          console.error("ERROR guardar persona (wrapped):", {
            status: e2.response?.status,
            data: e2.response?.data,
          });
          setErrorAlert({
            show: true,
            message:
              e2.response?.data?.mensaje ||
              e2.response?.data?.Message ||
              e2.response?.data?.error ||
              "Error al guardar la persona.",
            type: "error",
          });
          return;
        }
      }

      // Otros errores (no de validación de campos) → muestro detalle
      setErrorAlert({
        show: true,
        message: data?.mensaje || data?.Message || data?.error || "Error al guardar la persona.",
        type: "error",
      });
    }
  };

  // ⬇️ Para validar propTypes del cell Acciones
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
                    { Header: "Legajo", accessor: "legajo" },
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
                            {/* ⬇️ Mostrar Agregar persona SOLO cuando estado === "NE" */}
                            {estado === "NE" && (
                              <MDButton
                                variant="gradient"
                                color="warning"
                                size="small"
                                onClick={() => handleAgregarPersona(row.original)}
                              >
                                Agregar persona
                              </MDButton>
                            )}

                            {/* Mantengo tu regla original para POF (estado === "NP") */}
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

      {/* Modal POF (existente) */}
      <ModalAgregarPOF
        open={showAgregarPOFModal}
        onClose={handleClosePOFModal}
        persona={personaSeleccionada}
        onSave={handleGuardarPOF}
      />

      {/* ⬇️ Modal NUEVO: Agregar Persona */}
      <Dialog
        open={showAgregarPersonaModal}
        onClose={() => setShowAgregarPersonaModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Persona</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
                label="Legajo"
                name="legajo"
                fullWidth
                value={personaForm.legajo}
                onChange={(e) => setPersonaForm((p) => ({ ...p, legajo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="DNI"
                name="dni"
                fullWidth
                value={personaForm.dni}
                onChange={(e) => setPersonaForm((p) => ({ ...p, dni: e.target.value }))}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Apellido"
                name="apellido"
                fullWidth
                value={personaForm.apellido}
                onChange={(e) => setPersonaForm((p) => ({ ...p, apellido: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Nombre"
                name="nombre"
                fullWidth
                value={personaForm.nombre}
                onChange={(e) => setPersonaForm((p) => ({ ...p, nombre: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton
            color="secondary"
            size="small"
            variant="contained"
            onClick={() => setShowAgregarPersonaModal(false)}
          >
            Cancelar
          </MDButton>
          <MDButton color="success" size="small" variant="contained" onClick={handleGuardarPersona}>
            Agregar persona
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
