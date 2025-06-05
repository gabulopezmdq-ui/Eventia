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
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function AltaCabeceraMovimientos() {
  const { id } = useParams();
  const [establecimientos, setEstablecimientos] = useState([]);
  const [formData, setFormData] = useState({
    Area: "",
    Mes: "",
    Anio: new Date().getFullYear().toString(),
    EstablecimientoId: "",
    Accion: [],
    Estado: "",
  });

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
    { label: "Cancelado", value: "C" },
    { label: "Success", value: "S" },
  ];

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await axios.get("/Establecimientos", {
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
    try {
      const payload = {
        ...formData,
        Accion: formData.Accion.join(""),
      };

      await axios.post("/CabeceraMovimientos", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Enviado correctamente");
    } catch (err) {
      console.error("Error al guardar", err);
      alert("Error al guardar");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox component="form" pb={3} px={3}>
        <Card>
          <Grid container spacing={3} p={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Área</InputLabel>
                <Select
                  name="Area"
                  value={formData.Area}
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
              <FormControl fullWidth>
                <Select
                  name="Mes"
                  value={formData.Mes}
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
                name="Anio"
                label="Año"
                type="number"
                inputProps={{ min: 1900, max: 2100 }}
                value={formData.Anio}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Select
                  name="Establecimiento"
                  label="Establecimiento"
                  value={formData.EstablecimientoId}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {establecimientos.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.nombre}
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
                  name="Estado"
                  value={formData.Estado}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
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

          <MDBox mt={3} p={2} display="flex" justifyContent="flex-end">
            <MDButton variant="contained" color="info" size="small" onClick={handleSubmit}>
              Guardar Cambios
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaCabeceraMovimientos;
