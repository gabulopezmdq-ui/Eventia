import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Grid, InputLabel, MenuItem, FormControl, Select } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import axios from "axios";

function CargarInasistencia() {
  const [cabeceras, setCabeceras] = useState([]);
  const [inasistencias, setInasistencias] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [cabecerasCargar, setCabeceraCargar] = useState([]);
  const [selectedCabecera, setSelectedCabecera] = useState("");
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState();
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("info");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}InasistenciasCabecera/GetAll`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filtrados = response.data.filter(
          (item) => item.estado === "R" && item.cabecera?.calculaInasistencias === "S"
        );

        setCabeceras(filtrados);
      } catch (error) {
        console.error("Error al obtener cabeceras:", error);
        setAlertMessage("Error al cargar las cabeceras de inasistencias.");
        setAlertType("error");
        setShowAlert(true);
      }
    };

    if (token) fetchEstablecimientos();
  }, [token]);

  const handleCargar = async () => {
    if (!selectedCabecera) {
      setAlertMessage("Por favor, seleccione una cabecera.");
      setAlertType("warning");
      setShowAlert(true);
      return;
    }

    const seleccionado = cabeceras.find((item) => item.idInasistenciaCabecera === selectedCabecera);

    if (!seleccionado) {
      setAlertMessage("No se encontró la cabecera seleccionada.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    const idEstablecimiento = seleccionado.idEstablecimiento;
    setEstablecimientoSeleccionado(idEstablecimiento);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}InasistenciasCabecera/GetFechas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            idEstablecimiento,
          },
        }
      );
      setCabeceraCargar(response.data || []);
    } catch (error) {
      console.error("Error al cargar listado de inasistencias:", error);
      setAlertMessage("Error al cargar el listado de inasistencias.");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleChangeCabecera = (event) => {
    setSelectedCabecera(event.target.value);
  };

  const handleInasistencias = async (anio, mes) => {
    if (!establecimientoSeleccionado) {
      setAlertMessage("No se ha seleccionado un establecimiento.");
      setAlertType("warning");
      setShowAlert(true);
      return;
    }

    setAnioSeleccionado(anio);
    setMesSeleccionado(mes);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}InasistenciasCabecera/InasistenciasListado`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            idEstablecimiento: establecimientoSeleccionado,
            anio,
            mes,
          },
        }
      );

      setInasistencias(response.data);
    } catch (error) {
      console.error("Error al obtener inasistencias:", error);
      setAlertMessage("Error al obtener las inasistencias.");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  const handleGenerarCabecera = async () => {
    const seleccionado = cabeceras.find((item) => item.idInasistenciaCabecera === selectedCabecera);

    if (!seleccionado) {
      setAlertMessage("No se encontró la cabecera seleccionada.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    try {
      const payload = {
        anio: anioSeleccionado,
        mes: mesSeleccionado,
        idCabecera: seleccionado.idCabecera,
        idEstablecimiento: seleccionado.idEstablecimiento,
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}InasistenciasCabecera/AddCabecera`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAlertMessage("Cabecera de inasistencia generada correctamente.");
      setAlertType("success");
      setShowAlert(true);
    } catch (error) {
      console.error("Error al generar la cabecera:", error);
      setAlertMessage("Error al generar la cabecera de inasistencia.");
      setAlertType("error");
      setShowAlert(true);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel id="establecimiento-select-label">Cabeceras</InputLabel>
              <Select
                labelId="establecimiento-select-label"
                value={selectedCabecera}
                onChange={handleChangeCabecera}
                label="Establecimiento"
                style={{ height: "2.5rem", backgroundColor: "white" }}
              >
                {cabeceras.map((item) => (
                  <MenuItem key={item.idInasistenciaCabecera} value={item.idInasistenciaCabecera}>
                    {item.establecimientos?.nombrePcia || "Sin nombre"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <MDBox>
              <MDButton variant="gradient" color="info" size="small" onClick={handleCargar}>
                Buscar
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      {showAlert && (
        <MDAlert color={alertType} dismissible onClose={() => setShowAlert(false)}>
          <MDTypography variant="body2" color="white">
            {alertMessage}
          </MDTypography>
        </MDAlert>
      )}

      {cabecerasCargar.length > 0 && (
        <Card>
          <DataTable
            table={{
              columns: [
                { Header: "Año", accessor: "anio" },
                { Header: "Mes", accessor: "mes" },
                {
                  Header: "Acciones",
                  accessor: "acciones",
                  Cell: ({ row }) => (
                    <MDBox display="flex" gap={1}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={() => handleInasistencias(row.original.anio, row.original.mes)}
                      >
                        Cargar
                      </MDButton>

                      {inasistencias &&
                        Array.isArray(inasistencias.detalle) &&
                        inasistencias.detalle.length === 0 &&
                        row.original.anio === anioSeleccionado &&
                        row.original.mes === mesSeleccionado && (
                          <MDButton
                            variant="gradient"
                            color="warning"
                            size="small"
                            onClick={handleGenerarCabecera}
                          >
                            Generar Cabecera Inasistencia
                          </MDButton>
                        )}
                    </MDBox>
                  ),
                },
              ],
              rows: cabecerasCargar,
            }}
            entriesPerPage={false}
            canSearch
          />
        </Card>
      )}
    </DashboardLayout>
  );
}

CargarInasistencia.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default CargarInasistencia;
