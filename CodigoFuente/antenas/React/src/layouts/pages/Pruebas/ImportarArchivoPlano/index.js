import { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem, Button, Grid, Alert } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDInput from "components/MDInput";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // Icono de archivo
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";

function ImportarArchivo() {
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]); // Para almacenar las personas
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const [file, setFile] = useState(null);
  const token = sessionStorage.getItem("token");
  const [filterIdCabecera, setFilterIdCabecera] = useState("");

  // Muestra los datos en una tabla
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
        } else {
          setErrorAlert({
            show: true,
            message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            type: "error",
          });
        }
      });
  }, []);

  useEffect(() => {
    axios
      .get("https://localhost:44382/CabeceraLiquidacion/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Mapea los datos para crear los valores concatenados
        const formattedCabeceras = response.data.map((item) => ({
          id: item.idCabecera, // Sigue usando idCabecera como identificador único
          displayText: `${item.tipoLiquidacion.descripcion} - ${item.mesLiquidacion}/${item.anioLiquidacion}`, // Concatenar los valores
        }));
        setIdCabeceras(formattedCabeceras);
      })
      .catch(() => {
        setErrorAlert({ show: true, message: "Error al cargar los idCabecera.", type: "error" });
      });
  }, [token]);

  // Manejar selección de archivo
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const filteredData = filterIdCabecera
    ? dataTableData.filter((item) => item.idCabecera === filterIdCabecera)
    : dataTableData;

  // Manejar importación del archivo
  const handleImport = async () => {
    if (!file || !selectedIdCabecera) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona un archivo y un idCabecera.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("idCabecera", selectedIdCabecera);

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
      setErrorAlert({ show: true, message: response.data, type: "success" });
    } catch (error) {
      const errorMessage = error.response?.data || "Error al importar el archivo.";
      setErrorAlert({ show: true, message: errorMessage, type: "error" });
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
          <Grid item xs={4}>
            <FormControl fullWidth>
              <MDInput
                select
                fullWidth
                label="Selecciona una Cabecera"
                value={selectedIdCabecera}
                onChange={(e) => setSelectedIdCabecera(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  height: "40px",
                  "& .MuiInputBase-root": {
                    height: "40px",
                    padding: "10px",
                  },
                }}
              >
                <MenuItem value="">
                  <em>Selecciona una Cabecera</em>
                </MenuItem>
                {idCabeceras.map((item, index) => (
                  <MenuItem key={index} value={item.id}>
                    {item.displayText} {/* Muestra el texto concatenado */}
                  </MenuItem>
                ))}
              </MDInput>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <label htmlFor="upload-file">
              <input
                type="file"
                accept=".xlsx, .xls"
                id="upload-file"
                style={{ display: "none" }} // Oculta el input file
                onChange={handleFileChange}
              />
              <MDButton
                variant="outlined"
                component="span"
                color="info"
                endIcon={<AttachFileIcon />} // Añadir el ícono a la derecha
              >
                Subir archivo
              </MDButton>
            </label>
          </Grid>
          <Grid item xs={3}>
            <MDButton variant="outlined" color="info" onClick={handleImport}>
              Cargar
            </MDButton>
          </Grid>
        </Grid>
      </Card>
      <MDBox my={2}>
        <Card>
          <FormControl sx={{ margin: 2 }}>
            <InputLabel
              id="filter-label"
              sx={{
                "&.Mui-focused": { color: "#1A73E8" }, // Estilo al enfocar
              }}
            >
              Filtrar por Cabecera
            </InputLabel>
            <Select
              labelId="filter-label"
              value={filterIdCabecera}
              onChange={(e) => setFilterIdCabecera(e.target.value)}
              sx={{
                height: "40px",
                "& .MuiSelect-select": {
                  height: "40px",
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                },
                "&:hover fieldset": {
                  borderColor: "#000", // Color del borde al pasar el mouse
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#000", // Color del borde al enfocar
                },
              }}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {idCabeceras.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.displayText} {/* Mostrar el texto concatenado */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>
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
              rows: filteredData, // Usa los datos filtrados
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
