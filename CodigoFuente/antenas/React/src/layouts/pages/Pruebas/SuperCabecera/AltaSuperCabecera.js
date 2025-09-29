import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Grid, Select, MenuItem, InputLabel, FormControl, TextField } from "@mui/material";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import jwt_decode from "jwt-decode";

function AltaSuperCabecera() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    area: "L",
    mes: "",
    anio: new Date().getFullYear().toString(),
    idEstablecimiento: "",
  });

  const [establecimientos, setEstablecimientos] = useState([]);
  const [formDeshabilitado, setFormDeshabilitado] = useState(false);

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

  // Cargar establecimientos y cabecera si es edición
  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await axios.get("https://localhost:44382/Establecimientos/GetAll", {
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
            `https://localhost:44382/MovimientosCabecera/GetById?id=${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const cabecera = res.data;
          setFormData({
            area: cabecera.area,
            mes: cabecera.mes,
            anio: cabecera.anio,
            idEstablecimiento: cabecera.idEstablecimiento,
          });
          setFormDeshabilitado(true);
        } catch (err) {
          console.error("Error al cargar SuperCabecera", err);
          alert("Error al cargar los datos de la SuperCabecera");
        }
      };
      fetchCabecera();
    }
  }, [id, token]);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar nueva SuperCabecera
  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44382/MovimientosCabecera/CabeceraMovimiento",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data === false || response.data?.success === false) {
        alert("Ya existe un registro con esa combinación IdEstablecimiento - Mes - Año - Área");
        navigate(-1);
        return;
      }

      alert("✅ Alta exitosa de la SuperCabecera");
      navigate("/SuperCabecera"); // volver al listado
    } catch (err) {
      console.error("Error al guardar SuperCabecera", err);
      alert("❌ Error al guardar la SuperCabecera");
    }
  };

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
                  label="Area"
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
                  label="Establecimiento"
                  name="idEstablecimiento"
                  value={formData.idEstablecimiento}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {establecimientos.map((e) => (
                    <MenuItem key={e.idEstablecimiento} value={e.idEstablecimiento}>
                      {e.nombrePcia.trim()}
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
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaSuperCabecera;
