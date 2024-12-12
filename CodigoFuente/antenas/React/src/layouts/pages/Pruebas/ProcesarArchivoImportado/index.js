import { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function ProcesarArchivoImportado() {
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const token = sessionStorage.getItem("token");

  // Obtener las cabeceras al cargar el componente
  useEffect(() => {
    axios
      .get("https://localhost:44382/CabeceraLiquidacion/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Respuesta del servidor:", response.data); // Verifica la respuesta
        const filteredCabeceras = response.data.filter((item) => item.estado === "I");
        console.log("Cabeceras filtradas:", filteredCabeceras); // Revisa los datos filtrados
        const formattedCabeceras = filteredCabeceras.map((item) => ({
          id: item.idCabecera,
          displayText: `${item.tipoLiquidacion.descripcion} - ${item.mesLiquidacion}/${item.anioLiquidacion}`,
        }));
        setIdCabeceras(formattedCabeceras);
      })
      .catch((error) => {
        console.error("Error al cargar las cabeceras:", error);
        setErrorAlert({ show: true, message: "Error al cargar las cabeceras.", type: "error" });
      });
  }, [token]);

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

    try {
      console.log("Enviando ID para procesamiento:", selectedIdCabecera);

      // Construir la URL con el parámetro idCabecera
      const url = `https://localhost:44382/ImportarMecanizadas/PreprocesarArchivo?idCabecera=${selectedIdCabecera}`;

      const response = await axios.post(
        url, // La URL incluye el parámetro
        null, // No se envía cuerpo en la solicitud
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token en los encabezados
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);

      // Manejar la respuesta
      setErrorAlert({
        show: true,
        message: response.data,
        type: "success",
      });
    } catch (error) {
      console.error("Error en la solicitud:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.mensaje || // Mensaje del backend
        error.response?.data?.title || // Si hay un título en la respuesta
        "Error al procesar el archivo.";
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
            >
              Procesar archivo importado
            </MDButton>
          </Grid>
        </Grid>
      </Card>
    </DashboardLayout>
  );
}

export default ProcesarArchivoImportado;
