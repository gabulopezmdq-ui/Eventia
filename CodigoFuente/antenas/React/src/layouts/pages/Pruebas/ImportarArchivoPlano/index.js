import { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem, Button, Grid, Alert } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";

function ImportarArchivo() {
  const [errorAlert, setErrorAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [dataTableData, setDataTableData] = useState([]);
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const [file, setFile] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Nuevo estado para habilitar/deshabilitar el botón
  const token = sessionStorage.getItem("token");
  const [filterIdCabecera, setFilterIdCabecera] = useState("");
  const [grillaActiva, setGrillaActiva] = useState(false); // Estado para activar/desactivar la grilla

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "ImportarMecanizadas/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setDataTableData(response.data))
      .catch((error) => {
        if (error.response) {
          const statusCode = error.response.status;
          let errorMessage = "";
          let errorType = "error";
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema con la solicitud del cliente.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema en el servidor.`;
          }
          setErrorAlert({ show: true, message: errorMessage, type: errorType });
          setErrorAlert(true);
          setAlertMessage(errorMessage);
          setAlertType("error");
          setTimeout(() => {
            setErrorAlert(false);
            setAlertMessage("");
            setAlertType("");
          }, 3000);
        } else {
          setErrorAlert(true);
          setAlertMessage("Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.");
          setAlertType("error");
          setTimeout(() => {
            setErrorAlert(false);
            setAlertMessage("");
            setAlertType("");
          }, 3000);
        }
      });
  }, []);

  useEffect(() => {
    axios
      .get("https://localhost:44382/CabeceraLiquidacion/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const formattedCabeceras = response.data.map((item) => ({
          id: item.idCabecera,
          displayText: `${item.tipoLiquidacion.descripcion} - ${item.mesLiquidacion}/${item.anioLiquidacion}`,
        }));
        setIdCabeceras(formattedCabeceras);
      })
      .catch(() => {
        setErrorAlert({ show: true, message: "Error al cargar los idCabecera.", type: "error" });
      });
  }, [token]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilterIdCabecera(selectedFilter);
    // Activamos la grilla solo cuando se selecciona un idCabecera
    setGrillaActiva(selectedFilter !== ""); // Si no hay un valor de filtro, la grilla no se mostrará
  };

  const filteredData = filterIdCabecera
    ? dataTableData.filter((item) => item.idCabecera === filterIdCabecera)
    : dataTableData;

  const handleImport = async () => {
    if (!file || !selectedIdCabecera) {
      setErrorAlert(true);
      setAlertMessage("Por favor, selecciona un archivo y un idCabecera.");
      setAlertType("error");
      setTimeout(() => {
        setErrorAlert(false);
        setAlertMessage("");
        setAlertType("");
      }, 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("idCabecera", selectedIdCabecera);

    setIsButtonDisabled(true); // Deshabilita el botón al iniciar la petición

    try {
      const response = await axios.post(
        "https://localhost:44382/ImportarMecanizadas/ImportarExcel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Comprueba si la respuesta es "Importación exitosa."
      if (response.data === "Importación exitosa.") {
        setErrorAlert(true); // Muestra el alert
        setAlertMessage(response.data); // Muestra el mensaje de éxito
        setAlertType("success"); // Estilo de alerta de éxito
      } else {
        // Maneja otros mensajes del backend
        setErrorAlert(true);
        setAlertMessage(response.data || "Respuesta inesperada del servidor.");
        setAlertType("info");
      }
    } catch (error) {
      const errorMessage = error.response?.data || "Error al importar el archivo.";
      setErrorAlert(true);
      setAlertType("error");
      setAlertMessage(errorMessage);
    } finally {
      setTimeout(() => {
        setErrorAlert(false);
        setAlertMessage("");
        setAlertType("");
      }, 3000);
      setIsButtonDisabled(false); // Habilita el botón después de recibir la respuesta
    }
  };

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
      <Grid container>
        <Grid item xs={4} mr={1}>
          <FormControl fullWidth>
            <InputLabel id="cabecera-select-label">Selecciona una Cabecera</InputLabel>
            <Select
              labelId="cabecera-select-label"
              value={selectedIdCabecera}
              onChange={(e) => setSelectedIdCabecera(e.target.value)}
              label="Selecciona una Cabecera"
              style={{ height: "2.5rem", backgroundColor: "white" }}
            >
              {idCabeceras.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.displayText}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item mr={1}>
          <label htmlFor="upload-file">
            <input
              type="file"
              accept=".txt"
              id="upload-file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <MDButton size="small" component="span" color="info" endIcon={<AttachFileIcon />}>
              Subir archivo
            </MDButton>
          </label>
        </Grid>
        <Grid item xs={3}>
          <MDButton
            size="small"
            color="success"
            onClick={handleImport}
            disabled={isButtonDisabled} // Botón deshabilitado según el estado
          >
            Cargar
          </MDButton>
        </Grid>
      </Grid>
      <MDBox my={2}>
        <FormControl fullWidth>
          <InputLabel id="cabecera-select-label">Filtrar por Cabecera</InputLabel>
          <Select
            labelId="cabecera-select-label"
            value={filterIdCabecera}
            onChange={(e) => setFilterIdCabecera(e.target.value)}
            label="Filtrar por Cabecera"
            style={{ height: "2.5rem", backgroundColor: "white" }}
          >
            <MenuItem value="">Todos</MenuItem>
            {idCabeceras.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.displayText}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Card sx={{ marginTop: 1 }}>
          <DataTable
            table={{
              columns: [
                { Header: "idTMP Mecanizada", accessor: "idTMPMecanizada" },
                {
                  Header: "fecha Importacion",
                  accessor: "fechaImportacion",
                  Cell: ({ value }) =>
                    value ? new Date(value).toLocaleDateString("es-ES") : "N/A",
                },
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
              rows: filteredData,
            }}
            entriesPerPage={false}
            canSearch
            show
          />
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default ImportarArchivo;
