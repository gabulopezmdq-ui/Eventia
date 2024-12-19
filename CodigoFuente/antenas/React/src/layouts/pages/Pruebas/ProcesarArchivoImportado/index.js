import { useState, useEffect } from "react";
import axios from "axios";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DataTableProcesar from "examples/Tables/DataTableProcesar";
import jsPDF from "jspdf";
import "jspdf-autotable";

function ProcesarArchivoImportado() {
  const [errorAlert, setErrorAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const [showErrorButton, setShowErrorButton] = useState(true);
  const [errorData, setErrorData] = useState([]); // Estado para almacenar los datos de los errores
  const [loadingErrors, setLoadingErrors] = useState(false); // Estado para indicar si se están cargando los errores
  const [carRevistaData, setCarRevistaData] = useState([]); // Estado para los datos de CarRevista
  const [conceptosData, setConceptosData] = useState([]);
  const [establecimientosData, setEstablecimientosData] = useState([]);
  const [funcionesData, setFuncionesData] = useState([]);
  const [mecanizadasData, setMecanizadasData] = useState([]);
  const [estData, setEstData] = useState([]);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get("https://localhost:44382/CabeceraLiquidacion/GetAll", {
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
      .catch((error) => {
        setErrorAlert(true);
        setAlertType("error");
        setAlertMessage("Error al cargar las cabeceras.");
        setTimeout(() => {
          setErrorAlert(false);
          setAlertType("");
          setAlertMessage("");
        }, 3000);
      });
  }, [token]);
  // Generar PDF con los errores
  const handleGeneratePDF = async () => {
    setLoadingErrors(true); // Indicar que se está cargando la información

    try {
      const responses = await Promise.all([
        axios.get("https://localhost:44382/TMPErrores/GetAllCarRevista", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://localhost:44382/TMPErrores/GetAllConceptos", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://localhost:44382/TMPErrores/GetAllEstablecimientos", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://localhost:44382/TMPErrores/GetAllFunciones", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://localhost:44382/TMPErrores/GetAllMecanizadas", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://localhost:44382/TMPErrores/GetAllTipoEst", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Configurar qué campos incluir para cada sección
      const dataToInclude = [
        {
          title: "Paramétricas - Caracteres de Revista",
          data: responses[0].data.map((item) => ({
            COD_PCIA: item.caracterRevista,
          })),
        },
        {
          title: "Paramétricas - Conceptos",
          data: responses[1].data.map((item) => ({
            COD_CONCEPTO_PROVINCIA: item.codigoLiquidacion,
          })),
        },
        {
          title: "Paramétricas - Establecimientos",
          data: responses[2].data.map((item) => ({
            COD_TIPO_ESTABLECIMIENTO: item.NroEstab,
          })),
        },
        {
          title: "Paramétricas - Tipos de Funciones",
          data: responses[3].data.map((item) => ({
            COD_FUNCION_PCA: item.CodFuncion,
          })),
        },
        {
          title: "Paramétricas - Mecanizadas",
          data: responses[4].data.map((item) => ({
            MECANIZADAS: item.codigoLiquidacion,
          })),
        },
        {
          title: "Paramétricas - Tipos de Establecimientos",
          data: responses[5].data.map((item) => ({
            COD_TIPO_ESTABLECIMIENTO: item.TipoOrganizacion,
          })),
        },
      ];

      // Crear el PDF
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Errores Detectados", 10, 10);

      // Agregar las tablas de errores
      dataToInclude.forEach((section, index) => {
        if (section.data.length > 0) {
          if (index !== 0) doc.addPage(); // Agregar nueva página para secciones siguientes
          doc.text(section.title, 10, 20);
          doc.autoTable({
            head: [Object.keys(section.data[0])], // Claves seleccionadas como cabecera
            body: section.data.map((row) => Object.values(row)), // Valores seleccionados como filas
            startY: 30,
          });
        }
      });

      // Descargar el PDF
      doc.save("ErroresDetectados.pdf");
      setLoadingErrors(false); // Finalizar la carga
    } catch (error) {
      setLoadingErrors(false); // Finalizar la carga en caso de error
      const errorMessage =
        error.response?.data?.mensaje || error.response?.data?.title || "Error al generar el PDF.";
      setErrorAlert({ show: true, message: errorMessage, type: "error" });
    }
  };

  const handleProcessFile = async () => {
    if (!selectedIdCabecera) {
      setErrorAlert(true);
      setAlertType("error");
      setAlertMessage("Por favor, selecciona una cabecera antes de continuar.");
      setTimeout(() => {
        setErrorAlert(false);
        setAlertType("");
        setAlertMessage("");
      }, 3000);
      return;
    }

    try {
      const url = `https://localhost:44382/ImportarMecanizadas/PreprocesarArchivo?idCabecera=${selectedIdCabecera}`;
      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setErrorAlert(true);
      setAlertType("success");
      setAlertMessage("El archivo ha sido procesado.");
      setTimeout(() => {
        setErrorAlert(false);
        setAlertType("");
        setAlertMessage("");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.mensaje ||
        error.response?.data?.title ||
        "Error al procesar el archivo.";
      setErrorAlert(false);
      setAlertType("error");
      setAlertMessage(errorMessage);
      setTimeout(() => {
        setErrorAlert(false);
        setAlertType("error");
        setAlertMessage("");
      }, 3000);
    }
  };

  // Obtener los datos de errores

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {errorAlert && (
        <MDAlert color={alertType} dismissible onClose={() => setErrorAlert({ show: false })}>
          <MDTypography variant="body2" color="white">
            {alertMessage}
          </MDTypography>
        </MDAlert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel id="filter-label"> Seleccionar Cabecera </InputLabel>
            <Select
              labelId="filter-label"
              value={selectedIdCabecera}
              onChange={(e) => setSelectedIdCabecera(e.target.value)}
              style={{ height: "2.5rem", backgroundColor: "white" }}
              label="Seleccionar Cabecera"
            >
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
            size="small"
            color="info"
            onClick={handleProcessFile}
            endIcon={<DeleteOutlineIcon />}
          >
            Procesar archivo importado
          </MDButton>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default ProcesarArchivoImportado;
