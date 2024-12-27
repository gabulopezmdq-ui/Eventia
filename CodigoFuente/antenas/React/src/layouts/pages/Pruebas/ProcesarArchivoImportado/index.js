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
import Box from "@mui/material/Box";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DataTableProcesar from "examples/Tables/DataTableProcesar";
import jsPDF from "jspdf";
import "jspdf-autotable";

function ProcesarArchivoImportado() {
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const [showErrorButton, setShowErrorButton] = useState(false);
  const [errorData, setErrorData] = useState([]); // Estado para almacenar los datos de los errores
  const [loadingErrors, setLoadingErrors] = useState(false); // Estado para indicar si se están cargando los errores
  const [isProcessing, setIsProcessing] = useState(false); // Nuevo estado

  const token = sessionStorage.getItem("token");

  // Obtener las cabeceras al cargar el componente
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
        setErrorAlert({ show: true, message: "Error al cargar las cabeceras.", type: "error" });
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
      //doc.text("Errores Detectados", 10, 10);
      let firstPage = true; // Bandera para evitar una primera página en blanco

      // Agregar las tablas de errores
      dataToInclude.forEach((section) => {
        if (section.data.length > 0) {
          if (!firstPage) doc.addPage(); // Agregar nueva página solo si no es la primera
          firstPage = false; // Cambiar bandera después de la primera sección
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

  // Procesar los archivos importados
  const handleProcessFile = async () => {
    if (!selectedIdCabecera) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona una cabecera antes de continuar.",
        type: "error",
      });
      return;
    }
    setIsProcessing(true); // Deshabilitar el botón antes de iniciar el proceso

    try {
      const url = `https://localhost:44382/ImportarMecanizadas/PreprocesarArchivo?idCabecera=${selectedIdCabecera}`;
      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Si el procesamiento es exitoso, ocultamos el botón de errores
      setShowErrorButton(false);
      setErrorAlert({
        show: true,
        message: "Archivo procesado exitosamente.",
        type: "success",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.mensaje || "Error inesperado al procesar el archivo.";
      setErrorAlert({ show: true, message: errorMessage, type: "error" });

      // Mostrar siempre el botón de "Ver errores" cuando ocurre un error
      setShowErrorButton(true);
    } finally {
      setIsProcessing(false); // Habilitar el botón después de completar el proceso
    }
  };

  // Obtener los datos de errores

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {errorAlert.show && (
        <MDAlert severity={errorAlert.type} onClose={() => setErrorAlert({ show: false })}>
          {errorAlert.message}
        </MDAlert>
      )}
      <Card sx={{ width: "70%", margin: "0 auto" }}>
        <Grid container spacing={2} sx={{ m: 3 }}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel
                id="filter-label"
                sx={{
                  "&.Mui-focused": { color: "#1A73E8" },
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
                    borderColor: "#000",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000",
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
          <Grid item xs={5}>
            <MDButton
              variant="outlined"
              color="error"
              onClick={handleProcessFile}
              endIcon={<DeleteOutlineIcon />}
              disabled={isProcessing} // Deshabilitar el botón mientras se procesa
            >
              Procesar archivo importado
            </MDButton>
          </Grid>
        </Grid>
        {showErrorButton && (
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <MDButton
              variant="contained"
              color="warning"
              onClick={handleGeneratePDF}
              disabled={loadingErrors}
            >
              {loadingErrors ? "Cargando..." : "Ver errores"}
            </MDButton>
          </Grid>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default ProcesarArchivoImportado;
