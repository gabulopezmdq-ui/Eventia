import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Grid, InputLabel, MenuItem, FormControl, Select } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import jwtDecode from "jwt-decode";
import MDAlert from "components/MDAlert";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import TablaProcesados from "./TablaProcesados";
import { generatePDF } from "../GeneradorPDF";
import ImportarInasistenciaModal from "./PopUp";
import axios from "axios";
function CargarInasistencia() {
  const [cabeceras, setCabeceras] = useState([]);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [procesados, setProcesados] = useState([]);
  const [ueSeleccionada, setUESeleccionada] = useState("");
  const [registrosProcesados, setRegistrosProcesados] = useState([]);
  const [erroresProcesados, setErroresProcesados] = useState([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [cabecerasCargar, setCabeceraCargar] = useState([]);
  const [selectedCabecera, setSelectedCabecera] = useState("");
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("info");
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setAlertMessage("");
        setAlertType("info");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);
  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}CabeceraLiquidacion/getall`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filtrados = response.data.filter(
          (item) => item.estado === "R" && item.calculaInasistencias === "S"
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

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const decoded = jwtDecode(token);
        const roles = decoded?.role || [];
        const idsAsociados = decoded?.idEstablecimiento || [];

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}Establecimientos/GetAll`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const dataFiltrada = roles.includes("superAdmin")
          ? response.data
          : response.data.filter((est) => idsAsociados.includes(est.idEstablecimiento.toString()));

        setEstablecimientos(dataFiltrada);
      } catch (error) {
        console.error("Error al obtener establecimientos:", error);
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

    const seleccionado = cabeceras.find((item) => item.idCabecera === selectedCabecera);
    if (!seleccionado) {
      setAlertMessage("No se encontró la cabecera seleccionada.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    const anio = seleccionado.anioLiquidacion;
    const mes = seleccionado.mesLiquidacion;
    const idCabecera = seleccionado.idCabecera;
    setUESeleccionada(seleccionado.establecimientos?.ue || "");

    try {
      // limpiar resultados y estados previos
      setCabeceraCargar([]);
      setProcesados([]);
      setErroresProcesados([]);
      setRegistrosProcesados([]);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}InasistenciasCabecera/InasistenciasListado`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            anio,
            mes,
            idCabecera,
            idEstablecimiento: selectedEstablecimiento,
          },
        }
      );

      const data = Array.isArray(response.data) ? response.data : [response.data];
      setCabeceraCargar(data);
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
  const handleChangeEstablecimiento = (event) => {
    setSelectedEstablecimiento(event.target.value);
  };
  const handleProcesar = async (row) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}inasistenciascabecera/procesar`;

      const payload = {
        IdCabeceraLiquidacion: row.idCabecera,
        IdCabeceraInasistencia: row.idInasistenciaCabecera,
        IdEstablecimiento: row.idEstablecimiento,
        UE: row.establecimientos.ue,
      };

      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status !== 200) throw new Error(`Error: ${response.statusText}`);

      if (response.data.mensaje === "Se encontraron errores") {
        const params = {
          IdCabeceraLiquidacion: row.idCabecera,
          IdCabeceraInasistencia: row.idInasistenciaCabecera,
          IdEstablecimiento: row.idEstablecimiento,
          UE: row.establecimientos.ue,
        };

        const erroresResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}inasistenciascabecera/ErroresInas`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params, // enviamos los datos como query params
          }
        );

        setAlertMessage("Se encontraron errores en el procesamiento. Descargue el PDF");
        setAlertType("error");
        setShowAlert(true);

        setErroresProcesados(erroresResponse.data || []);
      } else {
        // Si no hay errores, traer registros procesados
        const procesadosResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}inasistenciascabecera/RegistrosProcesados`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRegistrosProcesados(procesadosResponse.data || []);
        setAlertMessage("Procesamiento generado correctamente.");
        setAlertType("success");
        setShowAlert(true);
      }
    } catch (error) {
      console.error(error);
      setAlertMessage("Error al generar procesamiento: " + error.message);
      setAlertType("error");
      setShowAlert(true);
    }
  };
  const handleAgregarInasistencia = async (payload) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}inasistenciascabecera/AgregarDetalle`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlertMessage("Inasistencia agregada correctamente.");
      setAlertType("success");
      setShowAlert(true);

      // Opcional: refrescar la tabla
      const procesadosResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}inasistenciascabecera/RegistrosProcesados`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegistrosProcesados(procesadosResponse.data || []);
    } catch (error) {
      console.error(error);
      setAlertMessage("Error al agregar inasistencia: " + error.message);
      setAlertType("error");
      setShowAlert(true);
    }
  };
  const AccionesCell = ({ row }) => {
    const { original } = row;
    const yaProcesado = procesados.includes(original.idInasistenciaCabecera);

    return (
      <MDBox display="flex" gap={1}>
        {original.estado === "H" && !yaProcesado && (
          <MDButton
            variant="gradient"
            color="warning"
            size="small"
            onClick={() => setDetalleSeleccionado(original)}
          >
            Cargar Inasistencia
          </MDButton>
        )}

        {yaProcesado && (
          <MDButton
            variant="gradient"
            color="info"
            size="small"
            onClick={() => handleProcesar(original)}
          >
            Generar Procesamientos
          </MDButton>
        )}
        {erroresProcesados.length > 0 && (
          <MDButton
            variant="gradient"
            color="warning"
            size="small"
            onClick={() => generatePDF(erroresProcesados)}
          >
            Descargar errores
          </MDButton>
        )}
      </MDBox>
    );
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
                  <MenuItem key={item.idCabecera} value={item.idCabecera}>
                    {item.tipoLiquidacion.descripcion} {item.anioLiquidacion}/{item.mesLiquidacion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel id="establecimiento-select-label">Establecimiento</InputLabel>
              <Select
                labelId="establecimiento-select-label"
                value={selectedEstablecimiento}
                onChange={handleChangeEstablecimiento}
                label="Establecimiento"
                style={{ height: "2.5rem", backgroundColor: "white" }}
              >
                {establecimientos.map((est) => (
                  <MenuItem key={est.idEstablecimiento} value={est.idEstablecimiento}>
                    {est.nombrePcia}
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
                { Header: "Mes", accessor: "mes" },
                { Header: "Año", accessor: "anio" },
                { Header: "Tipo Liquidacion", accessor: "cabecera.tipoLiquidacion.descripcion" },
                { Header: "Estado", accessor: "estado" },
                {
                  Header: "Acciones",
                  accessor: "acciones",
                  Cell: AccionesCell,
                },
              ],
              rows: cabecerasCargar,
            }}
            entriesPerPage={false}
          />
        </Card>
      )}
      {detalleSeleccionado && (
        <ImportarInasistenciaModal
          open={!!detalleSeleccionado}
          onClose={() => setDetalleSeleccionado(null)}
          cabecera={detalleSeleccionado}
          onSuccess={(detalle) => {
            handleCargar();
            setProcesados((prev) => [...prev, detalle.idInasistenciaCabecera]);
          }}
        />
      )}
      {registrosProcesados.length > 0 && (
        <TablaProcesados
          data={registrosProcesados}
          onAgregarInasistencia={handleAgregarInasistencia}
        />
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
