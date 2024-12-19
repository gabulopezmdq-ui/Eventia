import { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function ProcesarArchivoImportado() {
  const [errorAlert, setErrorAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
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
