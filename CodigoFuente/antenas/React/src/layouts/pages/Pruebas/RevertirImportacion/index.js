import { useState, useEffect } from "react";
import axios from "axios";
import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function ImportarArchivo() {
  const [errorAlert, setErrorAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [idCabeceras, setIdCabeceras] = useState([]);
  const [selectedIdCabecera, setSelectedIdCabecera] = useState("");
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
        setErrorAlert(true);
        setAlertMessage("Error al cargar las cabeceras.");
        setAlertType("error");
        setTimeout(() => {
          setErrorAlert(false);
          setAlertMessage("");
          setAlertType("");
        }, 3000);
      });
  }, [token]);

  const handleRevert = async () => {
    if (!selectedIdCabecera) {
      setErrorAlert(true);
      setAlertMessage("Por favor, selecciona una cabecera antes de continuar.");
      setAlertType("error");
      setTimeout(() => {
        setErrorAlert(false);
        setAlertMessage("");
        setAlertType("");
      }, 3000);
      return;
    }

    try {
      const idCabecera = Number(selectedIdCabecera);
      const response = await axios.post(
        `https://localhost:44382/ImportarMecanizadas/RevertirExcel?idCabecera=${idCabecera}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setErrorAlert(true);
      setAlertMessage("Importación eliminada.");
      setAlertType("success");
      setTimeout(() => {
        setErrorAlert(false);
        setAlertMessage("");
        setAlertType("");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.[""]?.[0] ||
        error.response?.data?.title ||
        "Error al procesar la solicitud.";
      setErrorAlert(true);
      setAlertType("error");
      setAlertMessage(errorMessage);
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
        setErrorAlert(false);
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
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="filter-label"> Seleccionar Cabecera</InputLabel>
            <Select
              labelId="filter-label"
              value={selectedIdCabecera}
              onChange={(e) => setSelectedIdCabecera(e.target.value)}
              style={{ height: "2.5rem", backgroundColor: "white" }}
              label="Seleccionar una Cabecera"
            >
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
            size="small"
            color="error"
            onClick={handleRevert}
            endIcon={<DeleteOutlineIcon />}
          >
            Revertir
          </MDButton>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default ImportarArchivo;
