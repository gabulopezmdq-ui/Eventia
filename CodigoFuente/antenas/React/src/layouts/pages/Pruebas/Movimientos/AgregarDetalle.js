import React, { useState, useEffect } from "react";
import { Grid, TextField, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";

export default function AgregarDetalle({ onSubmit, ruralidad }) {
  const [observacionSeleccionada, setObservacionSeleccionada] = useState("");
  const [observacionesFiltradas, setObservacionesFiltradas] = useState([]);
  const [observacionesOpciones, setObservacionesOpciones] = useState([]);
  const [form, setForm] = useState({
    tipoMovimiento: "",
    SitRevista: "",
    funcion: "",
    rural: "",
    turno: "",
    NumDoc: "",
    categoria: "",
    horas: "",
    antigAnos: "",
    antigMeses: "",
    observaciones: "",
    TipoDoc: "",
    apellido: "",
    nombre: "",
    docente: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  const isAlta = form.tipoMovimiento === "A";
  const isBajaOModifOAdic = ["B", "M", "D"].includes(form.tipoMovimiento);

  useEffect(() => {
    const fetchObservaciones = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL + "TiposMovimientos/GetAll");
        const data = await response.json();
        setObservacionesOpciones(data);
      } catch (error) {
        console.error("Error al cargar observaciones:", error);
      }
    };

    fetchObservaciones();
  }, []);
  useEffect(() => {
    if (ruralidad) {
      setForm((prev) => ({
        ...prev,
        rural: ruralidad,
      }));
    }
  }, [ruralidad]);
  useEffect(() => {
    const filtradas = observacionesOpciones.filter(
      (obs) => obs.tipoMovimiento === form.tipoMovimiento
    );
    setObservacionesFiltradas(filtradas);
    // Limpiar selección anterior si cambia el tipo
    setObservacionSeleccionada("");
    setForm((prev) => ({ ...prev, observaciones: "" }));
  }, [form.tipoMovimiento, observacionesOpciones]);

  return (
    <MDBox pb={3} px={3}>
      <Card>
        <Grid container spacing={3} p={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo Movimiento</InputLabel>
              <Select
                name="tipoMovimiento"
                label="Tipo Movimiento"
                value={form.tipoMovimiento}
                style={{ height: "2.8rem", backgroundColor: "white" }}
                onChange={handleChange}
              >
                <MenuItem value="A">Alta</MenuItem>
                <MenuItem value="B">Baja</MenuItem>
                <MenuItem value="M">Modificación</MenuItem>
                <MenuItem value="D">Adicional</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {isAlta && (
            <>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="TipoDoc"
                  label="Tipo Documento"
                  fullWidth
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="NumDoc" label="Nro" fullWidth onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="apellido" label="Apellido" fullWidth onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField name="nombre" label="Nombre" fullWidth onChange={handleChange} />
              </Grid>
            </>
          )}
          {isBajaOModifOAdic && (
            <Grid item xs={12}>
              <TextField name="docente" label="Docente" fullWidth onChange={handleChange} />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField name="SitRevista" label="Sit. Revista" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="funcion" label="Función" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="rural"
              label="Rural"
              fullWidth
              value={form.rural}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="turno" label="Turno" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="categoria" label="Categoría" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="horas" label="Horas" fullWidth onChange={handleChange} />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              name="antigAnos"
              label="Antig. Años"
              fullWidth
              disabled={isBajaOModifOAdic}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              name="antigMeses"
              label="Antig. Meses"
              fullWidth
              disabled={isBajaOModifOAdic}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Observaciones predefinidas</InputLabel>
              <Select
                value={observacionSeleccionada}
                label="Observaciones predefinidas"
                style={{ height: "2.8rem", backgroundColor: "white" }}
                onChange={(e) => {
                  const seleccion = e.target.value;
                  setObservacionSeleccionada(seleccion);
                  setForm((prev) => ({ ...prev, observaciones: seleccion }));
                }}
              >
                {observacionesFiltradas.length > 0 ? (
                  observacionesFiltradas.map((opcion) => (
                    <MenuItem key={opcion.idTipoMovimiento} value={opcion.leyenda}>
                      {opcion.leyenda}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No hay observaciones para este tipo de movimiento
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="observaciones"
              label="Observaciones"
              fullWidth
              multiline
              rows={3}
              value={form.observaciones}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <MDButton onClick={handleSubmit} size="small" color="info" variant="contained">
              Agregar Detalle
            </MDButton>
          </Grid>
        </Grid>
      </Card>
    </MDBox>
  );
}
AgregarDetalle.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  idCabecera: PropTypes.object,
  ruralidad: PropTypes.string,
};
