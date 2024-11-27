import { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function ImportarArchivo() {
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
  const token = sessionStorage.getItem("token");
  const idCabecera = Number(selectedIdCabecera);

  // Obtener las cabeceras al cargar la página
  useEffect(() => {
    axios
      .get("https://localhost:44382/CabeceraLiquidacion/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Mapea los datos para crear los valores concatenados
        const formattedCabeceras = response.data.map((item) => ({
          id: item.idCabecera, // ID único
          displayText: `${item.tipoLiquidacion.descripcion} - ${item.mesLiquidacion}/${item.anioLiquidacion}`, // Texto para mostrar
        }));
        setIdCabeceras(formattedCabeceras);
      })
      .catch(() => {
        setErrorAlert({ show: true, message: "Error al cargar las cabeceras.", type: "error" });
      });
  }, [token]);

  // Manejar acción del botón "Revertir"
  const handleRevert = async () => {
    if (!selectedIdCabecera) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona una cabecera antes de continuar.",
        type: "error",
      });
      return;
    }

    try {
      console.log("Enviando ID:", selectedIdCabecera);

      const response = await axios.post(
        "https://localhost:44382/ImportarMecanizadas/RevertirExcel",
        selectedIdCabecera, // Envía directamente el número
        {
          headers: {
            "Content-Type": "application/json", // Especifica el tipo de contenido
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setErrorAlert({ show: true, message: response.data, type: "success" });
    } catch (error) {
      console.error("Error en la solicitud:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.errors?.[""]?.[0] ||
        error.response?.data?.title ||
        "Error al procesar la solicitud.";
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
                  "&.Mui-focused": { color: "#1A73E8" }, // Estilo al enfocar
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
                    borderColor: "#000", // Color del borde al pasar el mouse
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000", // Color del borde al enfocar
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
          <Grid item xs={3}>
            <MDButton
              variant="outlined"
              color="error"
              onClick={handleRevert}
              endIcon={<DeleteOutlineIcon />} // Agrega el ícono aquí
            >
              Revertir
            </MDButton>
          </Grid>
        </Grid>
      </Card>
    </DashboardLayout>
  );
}

export default ImportarArchivo;
