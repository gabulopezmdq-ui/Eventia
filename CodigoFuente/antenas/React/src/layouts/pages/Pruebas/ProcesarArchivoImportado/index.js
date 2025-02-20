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
import DataTable from "examples/Tables/DataTable";
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
  const [dataTableData, setDataTableData] = useState([]);
  const [showDataTable, setShowDataTable] = useState(false);

  const token = sessionStorage.getItem("token");

  // Función para obtener datos desde la API
  useEffect(() => {
    if (token) {
      // ✅ Evita ejecutarse si el token no está listo
      fetchTMPMecanizadas();
    }
  }, [token]); // 🔹 Se ejecuta solo cuando el token cambia

  // Función para obtener datos desde la API
  const fetchTMPMecanizadas = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "TMPErrores/GetAllMecanizadas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos recibidos:", response.data); // 📌 Debugging

        // 🔥 Filtrar solo los registros con errores (registroValido = "N")
        const registrosConErrores = response.data.filter((item) => item.registroValido === "N");

        setDataTableData(registrosConErrores); // ✅ ACTUALIZA EL ESTADO SOLO CON ERRORES
      })
      .catch((error) => {
        console.error("Error al obtener TMPMecanizadas:", error);
        setErrorAlert({
          show: true,
          message: "Error al obtener TMPMecanizadas.",
          type: "error",
        });
      });
  };

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
            MECANIZADAS: item.TMPMecanizada.documento,
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

    const expectedErrorMessage =
      "El archivo contiene errores. Debe corregir el archivo y volver a importarlo.";
    const expectedTMPMessage = "Existen Personas que no están registradas en el sistema...";

    try {
      const url = `https://localhost:44382/ImportarMecanizadas/PreprocesarArchivo?idCabecera=${selectedIdCabecera}`;

      console.log("📢 URL de la solicitud:", url);

      const response = await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let backendMessage = response.data?.message?.trim().replace(/\n/g, " ") || "";

      if (backendMessage.includes(expectedErrorMessage)) {
        setShowErrorButton(true);
      } else {
        setShowErrorButton(false);
      }

      if (backendMessage.includes(expectedTMPMessage)) {
        console.log("✅ Mensaje de registros faltantes recibido:", backendMessage);
        setShowDataTable(true);
        await fetchDataForTable();
      } else {
        setShowDataTable(false);
      }
    } catch (error) {
      console.log("❌ Error en la respuesta del backend:", error.response?.data);

      const errorMessage =
        error.response?.data?.mensaje ||
        error.response?.data?.Message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data) ||
        "Error inesperado al procesar el archivo.";

      console.log("📢 Mensaje esperado:", expectedTMPMessage);
      console.log("📢 Mensaje recibido en error:", errorMessage);

      // 🚀 🔥 Si el mensaje esperado está en el error 400, aún así ejecutamos la lógica
      if (errorMessage.includes(expectedTMPMessage)) {
        console.log("✅ Mensaje de registros faltantes detectado en error 400.");
        setShowDataTable(true);
        await fetchDataForTable();
      } else {
        setErrorAlert({ show: true, message: errorMessage, type: "error" });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Nueva función para traer datos cuando hay registros faltantes
  const fetchDataForTable = async () => {
    try {
      console.log("📢 Haciendo la llamada GET a TMPErrores/GetAllMecanizadas...");
      const getResponse = await axios.get("https://localhost:44382/TMPErrores/GetAllMecanizadas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📢 Respuesta completa de la API:", getResponse);

      if (!getResponse?.data || getResponse.data.length === 0) {
        console.log("❌ No se recibieron datos o la respuesta está vacía.");
        return;
      }

      console.log("📢 Datos para la tabla:", getResponse.data);

      const formattedData = getResponse.data.map((item) => ({
        ...item,
        tmpMecanizadaDocumento: item.tmpMecanizada?.documento || "Sin datos",
      }));

      setDataTableData(formattedData);
    } catch (getError) {
      console.log("❌ Error en la llamada GET:", getError.response?.data || getError.message);
    }
  };

  //.......................... imprimir grilla.........................s
  const handleGenerateGridPDF = () => {
    if (dataTableData.length === 0) {
      setErrorAlert({
        show: true,
        message: "No hay datos en la grilla para exportar.",
        type: "warning",
      });
      return;
    }

    const doc = new jsPDF("landscape");
    doc.setFontSize(10);
    doc.text("Errores Detectados en Mecanizadas", 14, 10);

    // Transformar los datos antes de pasarlos a autoTable

    const columns = [
      { header: "DNI", dataKey: "documento" }, // Se usa dataKey en lugar de accessorKey
      { header: "POF", dataKey: "pof" },
      { header: "NÚMERO DNI", dataKey: "tmpMecanizadaDocumento" },
    ];
    const processedData = dataTableData.map((row) => ({
      documento: row.documento === "NE" ? "NO EXISTE" : row.documento,
      pof: row.pof === "NE" ? "NO EXISTE" : row.pof,
      tmpMecanizadaDocumento: row.tmpMecanizadaDocumento,
    }));

    doc.autoTable({
      columns,
      body: processedData, // Usamos los datos modificados
      startY: 20,
      margin: { top: 20 },
      styles: {
        fontSize: 9,
        cellPadding: 1.2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: "center",
      },
      columnStyles: {
        documento: { halign: "center", fontStyle: "normal" },
        pof: { halign: "center" },
        tmpMecanizadaDocumento: { halign: "center" },
      },
      didDrawPage: function (data) {
        doc.setFontSize(7);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 280, 200);
      },
    });

    doc.save("ErroresMecanizadas.pdf");
  };

  const handleProcessData = async () => {
    if (!selectedIdCabecera) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona una cabecera antes de continuar.",
        type: "error",
      });
      return;
    }

    setIsProcessing(true); // Deshabilitar el botón mientras se procesa

    try {
      const processUrl = `https://localhost:44382/ImportarMecanizadas/Procesar?idCabecera=${selectedIdCabecera}`;
      const processResponse = await axios.post(processUrl, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Procesamiento completado:", processResponse.data);
      setErrorAlert({ show: true, message: "Archivo procesado exitosamente.", type: "success" });
    } catch (error) {
      console.log("❌ Error en el procesamiento:", error.response?.data);
      setErrorAlert({
        show: true,
        message: error.response?.data || "Error al procesar los registros.",
        type: "error",
      });
    } finally {
      setIsProcessing(false); // Reactivar el botón
    }
  };

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
            <MDButton // Boton de pdf de errores de codigos
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
      {showDataTable && (
        <Card sx={{ marginTop: 1 }}>
          <DataTable
            table={{
              columns: [
                { Header: "Documento (Nivel Principal)", accessor: "documento" },
                { Header: "Pof", accessor: "pof" },
                { Header: "Documento (Anidado)", accessor: "tmpMecanizadaDocumento" }, // Usando el campo transformado
              ],
              rows: dataTableData,
            }}
            entriesPerPage={false}
            canSearch
            show
          />
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <MDButton variant="contained" color="warning" onClick={handleGenerateGridPDF}>
              {loadingErrors ? "Cargando..." : "Ver errores"}
            </MDButton>
          </Grid>
        </Card>
      )}
      <Grid container justifyContent="center" sx={{ mt: 2 }}>
        {/*<MDButton
          variant="contained"
          color="primary"
          onClick={handleProcessData}
          disabled={isProcessing}
        >
          {isProcessing ? "Procesando..." : "Procesar"}
        </MDButton>*/}
      </Grid>
    </DashboardLayout>
  );
}

export default ProcesarArchivoImportado;
