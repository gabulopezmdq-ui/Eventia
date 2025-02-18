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
      .get(process.env.REACT_APP_API_URL + "TMPMecanizadas/getall", {
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

    // ✅ Definir los mensajes esperados
    const expectedErrorMessage =
      "El archivo contiene errores. Debe corregir el archivo y volver a importarlo.";
    const expectedTMPMessage = "Existen Personas que no están registradas en el sistema...";

    try {
      const url = `https://localhost:44382/ImportarMecanizadas/PreprocesarArchivo?idCabecera=${selectedIdCabecera}`;
      const response = await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const backendMessage = response.data?.message?.trim().replace(/\n/g, " ");

      if (backendMessage === expectedErrorMessage) {
        setShowErrorButton(true);
      } else {
        setShowErrorButton(false);
      }

      if (backendMessage === expectedTMPMessage) {
        setShowDataTable(true);
        console.log("✅ Mensaje de registros faltantes recibido:", backendMessage);

        const getResponse = await axios.get("https://localhost:44382/TMPMecanizadas/GetAll", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDataTableData(getResponse.data);
      } else {
        setShowDataTable(false);
      }

      // ✅ Nuevo: Llamar al endpoint de Procesar después del preprocesamiento exitoso
      try {
        const processUrl = `https://localhost:44382/ImportarMecanizadas/Procesar?idCabecera=${selectedIdCabecera}`;
        const processResponse = await axios.post(processUrl, null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Procesamiento completado:", processResponse.data);
        setErrorAlert({ show: true, message: "Archivo procesado exitosamente.", type: "success" });
      } catch (processError) {
        console.log("❌ Error en el procesamiento:", processError.response?.data);
        setErrorAlert({
          show: true,
          message: processError.response?.data || "Error al procesar los registros.",
          type: "error",
        });
      }
    } catch (error) {
      console.log("📢 Respuesta completa del backend:", error.response?.data);

      const errorMessage =
        error.response?.data?.mensaje ||
        error.response?.data?.Message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data) ||
        "Error inesperado al procesar el archivo.";

      setErrorAlert({ show: true, message: errorMessage, type: "error" });

      console.log("📢 Mensaje esperado:", expectedTMPMessage);
      console.log("📢 Mensaje recibido:", errorMessage);
      console.log("📢 Coincidencia:", errorMessage.includes(expectedTMPMessage));

      if (errorMessage.includes(expectedTMPMessage)) {
        setShowDataTable(true);
        console.log("⚠️ Activando setShowDataTable: error de registros faltantes detectado.");
      } else {
        console.log("❌ No se detectó coincidencia.");
      }

      setShowErrorButton(errorMessage === expectedErrorMessage);
    } finally {
      setIsProcessing(false);
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

    const doc = new jsPDF("landscape"); // Horizontal para más espacio
    doc.setFontSize(10);
    doc.text("Errores Detectados en Mecanizadas", 14, 10);

    const columns = [
      { header: "Mes Liq.", dataKey: "mesLiquidacion" },
      { header: "Orden Pago", dataKey: "ordenPago" },
      { header: "Año/Mes", dataKey: "anioMesAfectacion" },
      { header: "DNI", dataKey: "documento" },
      { header: "Secuencia", dataKey: "secuencia" },
      { header: "Función", dataKey: "funcion" },
      { header: "Código Liq.", dataKey: "codigoLiquidacion" },
      { header: "Importe", dataKey: "importe" },
      { header: "Signo", dataKey: "signo" },
      { header: "Moneda", dataKey: "moneda" },
      { header: "Estatutario", dataKey: "regimenEstatutario" },
      { header: "Carácter Rev.", dataKey: "caracterRevista" },
      { header: "Dependencia", dataKey: "dependencia" },
      { header: "Distrito", dataKey: "distrito" },
      { header: "Org.", dataKey: "tipoOrganizacion" },
      { header: "Estab.", dataKey: "nroEstab" },
      { header: "Categoría", dataKey: "categoria" },
      { header: "Tipo Cargo", dataKey: "tipoCargo" },
      { header: "Horas", dataKey: "horasDesignadas" },
      { header: "Subvención", dataKey: "subvencion" },
      { header: "Válido", dataKey: "registroValido" },
    ];

    doc.autoTable({
      columns,
      body: dataTableData,
      startY: 20,
      margin: { top: 20 },
      styles: {
        fontSize: 7, // Letra más pequeña
        cellPadding: 1.2, // Menos espacio dentro de las celdas
        overflow: "linebreak", // Evita que el texto se salga de las celdas
      },
      headStyles: {
        fillColor: [41, 128, 185], // Azul elegante
        textColor: [255, 255, 255],
        fontSize: 8, // Letra un poco más grande en encabezado
        halign: "center",
      },
      columnStyles: {
        importe: { halign: "right" }, // Montos alineados a la derecha
        signo: { halign: "center" },
        registroValido: { halign: "center" },
        documento: { fontStyle: "bold" }, // DNI en negrita
      },
      didDrawPage: function (data) {
        doc.setFontSize(7);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 280, 200); // Número de página
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
      {showDataTable && (
        <Card sx={{ marginTop: 1 }}>
          <DataTable
            table={{
              columns: [
                { Header: "idTMP Mecanizada", accessor: "idTMPMecanizada" },
                { Header: "mes Liquidacion", accessor: "mesLiquidacion" },
                { Header: "orden Pago", accessor: "ordenPago" },
                { Header: "año Mes Afectacion", accessor: "anioMesAfectacion" },
                { Header: "dni", accessor: "documento" },
                { Header: "secuencia", accessor: "secuencia" },
                { Header: "funcion", accessor: "funcion" },
                { Header: "codigo Liquidacion", accessor: "codigoLiquidacion" },
                { Header: "importe", accessor: "importe" },
                { Header: "signo", accessor: "signo" },
                { Header: "marca Transferido", accessor: "marcaTransferido" },
                { Header: "moneda", accessor: "moneda" },
                { Header: "regimen Estatutario", accessor: "regimenEstatutario" },
                { Header: "caracter Revista", accessor: "caracterRevista" },
                { Header: "dependencia", accessor: "dependencia" },
                { Header: "distrito", accessor: "distrito" },
                { Header: "tipo Organizacion", accessor: "tipoOrganizacion" },
                { Header: "nroEstab", accessor: "nroEstab" },
                { Header: "categoria", accessor: "categoria" },
                { Header: "tipoCargo", accessor: "tipoCargo" },
                { Header: "horas Designadas", accessor: "horasDesignadas" },
                { Header: "subvencion", accessor: "subvencion" },
                { Header: "registroValido", accessor: "registroValido" },
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
        <MDButton
          variant="contained"
          color="primary"
          onClick={handleProcessData}
          disabled={isProcessing}
        >
          {isProcessing ? "Procesando..." : "Procesar"}
        </MDButton>
      </Grid>
    </DashboardLayout>
  );
}

export default ProcesarArchivoImportado;
