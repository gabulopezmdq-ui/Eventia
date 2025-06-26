import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
} from "@mui/material";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import AgregarDetalle from "./AgregarDetalle";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function AltaCabeceraMovimientos() {
  const { id } = useParams();
  const [establecimientos, setEstablecimientos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [mostrarFormularioDetalle, setMostrarFormularioDetalle] = useState(false);
  const [idCabecera, setIdCabecera] = useState(null);
  const [ruralidadCabecera, setRuralidadCabecera] = useState("");
  const [idEstablecimiento, setIdEstablecimiento] = useState("");
  const [detallesCargados, setDetallesCargados] = useState(false);
  const [formData, setFormData] = useState({
    area: "L",
    mes: "",
    anio: new Date().getFullYear().toString(),
    idEstablecimiento: "",
    Accion: [],
    estado: "P",
  });
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [formDeshabilitado, setFormDeshabilitado] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const areaOptions = [
    { label: "LIQUIDACIONES", value: "L" },
    { label: "LICENCIAS POR ENFERMEDAD", value: "E" },
    { label: "ASIGNACIONES FAMILIARES", value: "A" },
    { label: "COORDINACION ADMINISTRATIVA", value: "C" },
  ];

  const meses = [
    { label: "Enero", value: 1 },
    { label: "Febrero", value: 2 },
    { label: "Marzo", value: 3 },
    { label: "Abril", value: 4 },
    { label: "Mayo", value: 5 },
    { label: "Junio", value: 6 },
    { label: "Julio", value: 7 },
    { label: "Agosto", value: 8 },
    { label: "Septiembre", value: 9 },
    { label: "Octubre", value: 10 },
    { label: "Noviembre", value: 11 },
    { label: "Diciembre", value: 12 },
  ];

  const acciones = [
    { label: "Altas", value: "A" },
    { label: "Bajas", value: "B" },
    { label: "Modificaciones", value: "M" },
    { label: "Adicionales", value: "D" },
  ];

  const estados = [
    { label: "Pendiente", value: "P" },
    { label: "Enviado a Educación", value: "E" },
    { label: "Enviado a Provincia", value: "V" },
  ];

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + "Establecimientos/GetAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEstablecimientos(res.data);
      } catch (err) {
        console.error("Error al cargar establecimientos", err);
      }
    };

    fetchEstablecimientos();

    if (id) {
      const fetchCabecera = async () => {
        try {
          const res = await axios.get(
            process.env.REACT_APP_API_URL + `MovimientosCabecera/GetById?id=${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const cabecera = res.data;
          const accionesSeleccionadas = [];
          if (cabecera.altas === "A") accionesSeleccionadas.push("A");
          if (cabecera.bajas === "B") accionesSeleccionadas.push("B");
          if (cabecera.modificaciones === "M") accionesSeleccionadas.push("M");
          if (cabecera.adicionales === "D") accionesSeleccionadas.push("D");

          setFormData({
            area: cabecera.area,
            mes: cabecera.mes,
            anio: cabecera.anio,
            idEstablecimiento: cabecera.idEstablecimiento,
            Accion: accionesSeleccionadas,
            estado: cabecera.estado,
          });
          setIdCabecera(cabecera.id);
          setFormDeshabilitado(true);
          setMostrarDetalle(true);
          if (cabecera.establecimientos?.ruralidad) {
            setRuralidadCabecera(cabecera.establecimientos.ruralidad);
          }
          setIdEstablecimiento(cabecera.idEstablecimiento);
          fetchDetalles(cabecera.idMovimientoCabecera);
        } catch (err) {
          console.error("Error al cargar cabecera", err);
          alert("Error al cargar los datos de la cabecera");
        }
      };
      fetchCabecera();
    }
  }, [id, token]);

  const fetchDetalles = async (cabeceraId) => {
    try {
      const res = await axios.get(
        process.env.REACT_APP_API_URL +
          `MovimientosCabecera/DetallesCabecera?IdCabecera=${cabeceraId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetalles(res.data);
      setDetallesCargados(true);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("Entre al error 404 - No hay detalles cargados aún");
        setDetalles([]);
        setMostrarDetalle(true);
        setIdCabecera(cabeceraId);
      } else {
        console.error("Error al cargar detalles", err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      Accion: checked ? [...prev.Accion, value] : prev.Accion.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async () => {
    const { Accion, ...resto } = formData;

    const payload = {
      ...resto,
      altas: Accion.includes("A") ? "A" : null,
      bajas: Accion.includes("B") ? "B" : null,
      modificaciones: Accion.includes("M") ? "M" : null,
      adicionales: Accion.includes("D") ? "D" : null,
    };

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "MovimientosCabecera/CabeceraMovimiento",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data === false || response.data?.success === false) {
        alert("Ya existe un registro con esa combinación IdEstablecimiento - Mes - Año - Área");
        navigate(-1);
        return;
      }
      if (response.data && response.data.id) {
        setIdCabecera(response.data.id);
        fetchDetalles(response.data.id);
        setDetallesCargados(false);
      }

      alert("Alta exitosa de la Cabecera");
      setFormDeshabilitado(true);
      setMostrarDetalle(true);
    } catch (err) {
      if (err.response?.status === 404) {
        alert("Ya existe un registro con esa combinación IdEstablecimiento - Mes - Año - Área");
      } else {
        console.error("Error al guardar", err);
        alert("Error al guardar");
      }
    }
  };
  const handleDetalleSubmit = async (detalleData) => {
    try {
      const payload = {
        ...detalleData,
        IdMovimientoCabecera: idCabecera,
      };

      const response = await axios.put(
        process.env.REACT_APP_API_URL + "MovimientosCabecera",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Detalle guardado correctamente");
        fetchDetalles(idCabecera);
        setMostrarFormularioDetalle(false);
      }
    } catch (error) {
      console.error("Error al guardar el detalle:", error);
      alert("Error al guardar el detalle");
    }
  };

  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        // const res = await axios.get(process.env.REACT_APP_API_URL + "MovimientosCabecera/GetByVigente", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setDetalles(res.data);
        // Simulación temporal:
      } catch (err) {
        console.error("Error al cargar detalles", err);
      }
    };

    fetchDetalles();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox component="form" pb={3} px={3}>
        <Card>
          <Grid container spacing={3} p={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={formDeshabilitado}>
                <InputLabel>Área</InputLabel>
                <Select
                  name="area"
                  label="Área"
                  value={formData.area}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {areaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={formDeshabilitado}>
                <InputLabel>Mes</InputLabel>
                <Select
                  name="mes"
                  label="Mes"
                  value={formData.mes}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {meses.map((mes) => (
                    <MenuItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="anio"
                type="number"
                disabled={formDeshabilitado}
                value={formData.anio}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={formDeshabilitado}>
                <InputLabel>Establecimiento</InputLabel>
                <Select
                  name="idEstablecimiento"
                  label="Establecimiento"
                  value={formData.idEstablecimiento}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {establecimientos.map((e) => (
                    <MenuItem key={e.idEstablecimiento} value={e.idEstablecimiento}>
                      {e.nombrePcia}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormGroup row>
                {acciones.map((accion) => (
                  <FormControlLabel
                    key={accion.value}
                    control={
                      <Checkbox
                        value={accion.value}
                        disabled={formDeshabilitado}
                        checked={formData.Accion.includes(accion.value)}
                        onChange={handleCheckboxChange}
                      />
                    }
                    label={accion.label}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  label="Estado"
                  value={formData.estado}
                  style={{ height: "2.8rem" }}
                  disabled
                >
                  {estados.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {!id && !formDeshabilitado && (
            <MDBox mt={3} p={2} display="flex" justifyContent="flex-end">
              <MDButton variant="contained" color="info" size="small" onClick={handleSubmit}>
                Guardar
              </MDButton>
            </MDBox>
          )}
        </Card>
        {mostrarDetalle && idCabecera && (
          <>
            <MDBox mt={2} px={3} display="flex" justifyContent="flex-end">
              <MDButton
                variant="contained"
                color="success"
                size="small"
                onClick={() => setMostrarFormularioDetalle(true)}
              >
                Nuevo Detalle
              </MDButton>
            </MDBox>

            {mostrarFormularioDetalle && (
              <MDBox mt={3} px={3}>
                <AgregarDetalle
                  idCabecera={idCabecera}
                  idEstablecimiento={idEstablecimiento}
                  accionesDisponibles={formData.Accion}
                  ruralidad={ruralidadCabecera}
                  onSubmit={(data) => {
                    handleDetalleSubmit(data);
                    setMostrarFormularioDetalle(false);
                  }}
                  onCancel={() => setMostrarFormularioDetalle(false)}
                />
              </MDBox>
            )}
          </>
        )}
        {detalles.length > 0 && (
          <MDBox mt={3}>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "DNI", accessor: "dni" },
                    { Header: "SEC", accessor: "sec" },
                    { Header: "Apellido", accessor: "apellido" },
                    { Header: "Nombre", accessor: "nombre" },
                    { Header: "SitRev", accessor: "situacionRevista" },
                    { Header: "T Doc", accessor: "tipoDocumento" },
                    { Header: "Función", accessor: "funcion" },
                    { Header: "Rural", accessor: "rural" },
                    { Header: "Turno", accessor: "turno" },
                    { Header: "Cat", accessor: "categoria" },
                    { Header: "Hs", accessor: "horas" },
                    { Header: "Años", accessor: "antigAnos" },
                    { Header: "Meses", accessor: "antigMeses" },
                  ],
                  rows: detalles,
                }}
                entriesPerPage={false}
                canSearch
                showTotalEntries={false}
              />
            </Card>
          </MDBox>
        )}
      </MDBox>
    </DashboardLayout>
  );
}
export default AltaCabeceraMovimientos;
