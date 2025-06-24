import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  const [mostrarFormularioDetalle, setMostrarFormularioDetalle] = useState(true);
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

  const areaOptions = [
    { label: "LIQUIDACIONES", value: "L" },
    { label: "LICENCIAS POR ENFERMEDAD", value: "E" },
    { label: "ASIGNACIONES FAMILIARES", value: "A" },
    { label: "COORDINACION ADMINISTRATIVA", value: "C" },
  ];

  const meses = [
    { label: "Enero", value: "01" },
    { label: "Febrero", value: "02" },
    { label: "Marzo", value: "03" },
    { label: "Abril", value: "04" },
    { label: "Mayo", value: "05" },
    { label: "Junio", value: "06" },
    { label: "Julio", value: "07" },
    { label: "Agosto", value: "08" },
    { label: "Septiembre", value: "09" },
    { label: "Octubre", value: "10" },
    { label: "Noviembre", value: "11" },
    { label: "Diciembre", value: "12" },
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
  }, [token]);

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
        IdMovimientoCabecera: formData,
      };

      const response = await axios.put(
        process.env.REACT_APP_API_URL + "MovimientosCabecera",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Detalle guardado correctamente NUEVO JUAN");
      } else {
        alert("No se pudo guardar el detalle");
      }
    } catch (error) {
      console.error("Error al guardar el detalle:", error);
      alert("Ocurrió un error al guardar el detalle JUAN");
    }
  };
  /*const handleDetalleSubmit = async (detalleData) => {
    try {
      const payload = {
        ...detalleData,
        idCabecera: formData, // esto depende de cómo el backend espera el ID
      };

      // Simulás el post o hacés la petición real
      // const response = await axios.post(...);

      // Simulación de éxito
      console.log("Simulando guardado exitoso:", payload);
      setDetalles((prev) => [...prev, payload]); // lo agregás a la tabla

      alert("Detalle guardado correctamente");

      // ✅ Ocultás el formulario
      setMostrarFormularioDetalle(false);
    } catch (error) {
      console.error("Error al guardar el detalle:", error);
      alert("Ocurrió un error al guardar el detalle");
    }
  };*/

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
                  value={formData.estado}
                  style={{ height: "2.8rem", backgroundColor: "#e9e9e9" }}
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

          {!formDeshabilitado && (
            <MDBox mt={3} p={2} display="flex" justifyContent="flex-end">
              <MDButton variant="contained" color="info" size="small" onClick={handleSubmit}>
                Guardar
              </MDButton>
            </MDBox>
          )}
        </Card>
        {mostrarDetalle && mostrarFormularioDetalle && (
          <MDBox mt={3} px={3}>
            <AgregarDetalle idCabecera={formData} onSubmit={handleDetalleSubmit} />
          </MDBox>
        )}
        {!mostrarFormularioDetalle && (
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
