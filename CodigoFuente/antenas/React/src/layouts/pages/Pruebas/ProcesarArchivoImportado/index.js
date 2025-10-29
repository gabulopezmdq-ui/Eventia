import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircularProgress from "@mui/material/CircularProgress";
import ModalAgregarPOF from "./ModalAgregarPOF";

function ProcesarArchivoImportado() {
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorButton, setShowErrorButton] = useState(false);
  const [erroresMec, setErroresMec] = useState([]);
  const [showAgregarPOFModal, setShowAgregarPOFModal] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
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
        setErrorAlert({ show: true, message: "Error al cargar las cabeceras.", type: "error" });
      });
  }, [token]);

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

      const response = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });

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

      setErrorAlert({
        show: true,
        message: errorMessage,
        type: "error",
      });
      setTimeout(() => {
        setErrorAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
      if (error.response?.status >= 400) {
        setShowErrorButton(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewErrors = async () => {
    try {
      const url = process.env.REACT_APP_API_URL + "TMPErrores/GetErroresMec";

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setErroresMec(response.data);
      console.log("Errores mecanizadas:", response.data);
    } catch (error) {
      console.error("Error al obtener errores:", error.response);

      setErrorAlert({
        show: true,
        message: "No se pudieron obtener los errores.",
        type: "error",
      });

      setTimeout(() => setErrorAlert({ show: false, message: "", type: "error" }), 5000);
    }
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

  //* Acciones del POPUP*/
  const handleGuardarPOF = (formData) => {
    console.log("Datos a guardar:", formData);
    // 👉 Aquí llamamos al backend
    // axios.post("/TU_API", formData)

    setShowAgregarPOFModal(false);
    setPersonaSeleccionada(null);

    setErrorAlert({
      show: true,
      message: "POF guardado correctamente",
      type: "success",
    });
  };
  const handleAgregarPOF = (persona) => {
    setPersonaSeleccionada(persona);
    setShowAgregarPOFModal(true);
  };
  const handleClosePOFModal = () => {
    setShowAgregarPOFModal(false);
    setPersonaSeleccionada(null);
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
      {showErrorButton && (
        <Grid container justifyContent="center" mt={3}>
          <MDButton size="small" variant="gradient" color="error" onClick={handleViewErrors}>
            Ver errores
          </MDButton>
        </Grid>
      )}

      {isProcessing && (
        <Grid container direction="column" alignItems="center" justifyContent="center" mt={7}>
          <CircularProgress color="info" mb={3} />
          <span style={{ fontSize: "1.2rem", fontWeight: 500, color: "#333" }}>
            Procesando archivo importado...
          </span>
        </Grid>
      )}
      {erroresMec.length > 0 && (
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
                      const estado = row.original.estado;

                      return (
                        <MDBox display="flex" justifyContent="center" alignItems="center">
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
                          {estado === "NN" && (
                            <MDButton
                              variant="gradient"
                              color="warning"
                              size="small"
                              onClick={() => handleAgregarPersona(row.original)}
                            >
                              Agregar persona
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
      )}
      <ModalAgregarPOF
        open={showAgregarPOFModal}
        onClose={handleClosePOFModal}
        persona={personaSeleccionada}
        onSave={handleGuardarPOF}
      />
    </DashboardLayout>
  );
}

export default ProcesarArchivoImportado;
