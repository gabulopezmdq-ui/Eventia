import React, { useState, useEffect } from "react";
import { Grid, TextField, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";

export default function AgregarDetalle({
  onSubmit,
  ruralidad,
  idEstablecimiento,
  accionesDisponibles = [],
}) {
  const [observacionSeleccionada, setObservacionSeleccionada] = useState("");
  const [observacionesFiltradas, setObservacionesFiltradas] = useState([]);
  const [observacionesOpciones, setObservacionesOpciones] = useState([]);
  const [docentesOpciones, setDocentesOpciones] = useState([]);
  const [motivosOpciones, setMotivosOpciones] = useState([]);
  const [form, setForm] = useState({
    tipoMovimiento: "",
    sitRevista: "",
    funcion: "",
    rural: "",
    turno: "",
    numDoc: "",
    categoria: "",
    horas: "",
    antigAnos: "",
    antigMeses: "",
    observaciones: "",
    tipoDoc: "",
    apellido: "",
    nombre: "",
    docente: "",
    idPOF: "", // Nuevo campo agregado
    fechaInicioBaja: "",
    fechaFinBaja: "",
    idMotivoBaja: "",
  });
  const isBaja = form.tipoMovimiento === "B";
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Preparar objeto para enviar
    const formData = { ...form };
    if (isBajaOModifOAdic) {
      // Para Baja, Modificación o Adicional
      formData.idPOF = form.idPOF; // Enviar idPOF
      // Eliminar campos que no deben enviarse
      delete formData.docente;
      delete formData.tipoDoc;
      delete formData.numDoc;
    } else if (isAlta) {
      // Para Alta
      delete formData.idPOF;
      delete formData.docente;
    }
    onSubmit(formData);
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
    const fetchDocentes = async () => {
      try {
        if (!idEstablecimiento) return;

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}movimientosCabecera/POF?Idestablecimiento=${idEstablecimiento}`
        );
        const data = await response.json();
        setDocentesOpciones(data);
      } catch (error) {
        console.error("Error al cargar docentes:", error);
      }
    };

    fetchDocentes();
  }, [idEstablecimiento]);

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
    setObservacionSeleccionada("");
    setForm((prev) => ({ ...prev, observaciones: "" }));
  }, [form.tipoMovimiento, observacionesOpciones]);

  useEffect(() => {
    if (form.docente && docentesOpciones.length > 0) {
      const docenteSeleccionado = docentesOpciones.find((doc) => doc.idPersona === form.docente);
      if (docenteSeleccionado) {
        setForm((prev) => ({
          ...prev,
          funcion: docenteSeleccionado.funcion || "",
          categoria: docenteSeleccionado.categoria || "",
        }));
      }
    }
  }, [form.docente, docentesOpciones]);

  useEffect(() => {
    const fetchMotivos = async () => {
      if (form.tipoMovimiento !== "B") return;

      try {
        const response = await fetch(process.env.REACT_APP_API_URL + "MotivosBajasDoc/Getall");
        const data = await response.json();
        setMotivosOpciones(data);
      } catch (error) {
        console.error("Error al cargar motivos de baja:", error);
      }
    };

    fetchMotivos();
  }, [form.tipoMovimiento]);

  const tipoMovimientoLabels = {
    A: "Alta",
    B: "Baja",
    M: "Modificación",
    D: "Adicional",
  };

  const situacionRevistaOpciones = [
    { value: "11", label: "Docente Titular" },
    { value: "P", label: "Provisorio" },
    { value: "21", label: "Docente Suplente" },
    { value: "31", label: "Docente suplente de titular en licencia por maternidad" },
  ];

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
                {accionesDisponibles.length > 0 ? (
                  accionesDisponibles.map((accion) => (
                    <MenuItem key={accion} value={accion}>
                      {tipoMovimientoLabels[accion] || accion}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No hay acciones disponibles
                  </MenuItem>
                )}
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
                <TextField
                  name="apellido"
                  label="Apellido"
                  fullWidth
                  value={form.apellido}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="nombre"
                  label="Nombre"
                  fullWidth
                  value={form.nombre}
                  onChange={handleChange}
                />
              </Grid>
            </>
          )}
          {isBajaOModifOAdic && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Docente</InputLabel>
                <Select
                  name="docente"
                  label="Docente"
                  value={form.docente}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const docenteSeleccionado = docentesOpciones.find(
                      (doc) => doc.idPersona === selectedId
                    );

                    setForm((prev) => ({
                      ...prev,
                      docente: selectedId,
                      idPOF: docenteSeleccionado.idPOF, // Guardar idPOF
                      nombre: docenteSeleccionado.personaNombre, // Cargar nombre
                      apellido: docenteSeleccionado.personaApellido, // Cargar apellido
                      funcion: docenteSeleccionado?.funcion || "",
                      categoria: docenteSeleccionado?.categoria || "",
                    }));
                  }}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {docentesOpciones.length > 0 ? (
                    docentesOpciones.map((doc) => (
                      <MenuItem key={doc.idPersona} value={doc.idPersona}>
                        {`${doc.personaDNI} - ${doc.secuencia} - ${doc.personaApellido} ${doc.personaNombre}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No hay docentes disponibles
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sit.Revista</InputLabel>
              <Select
                name="sitRevista"
                label="Sit.Revista"
                value={form.sitRevista}
                onChange={handleChange}
                style={{ height: "2.8rem", backgroundColor: "white" }}
              >
                {situacionRevistaOpciones.map((opcion) => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="funcion"
              label="Función"
              fullWidth
              value={form.funcion}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="rural"
              label="Rural"
              fullWidth
              value={form.rural}
              onChange={handleChange}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="turno" label="Turno" fullWidth onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="categoria"
              label="Categoría"
              fullWidth
              value={form.categoria}
              onChange={handleChange}
            />
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
          {isBaja && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="fechaInicioBaja"
                  label="Inicio"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.fechaInicioBaja}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="fechaFinBaja"
                  label="Fin"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.fechaFinBaja}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Motivo de Baja</InputLabel>
                  <Select
                    name="idMotivoBaja"
                    value={form.idMotivoBaja}
                    label="Motivo de Baja"
                    onChange={handleChange}
                    style={{ height: "2.8rem", backgroundColor: "white" }}
                  >
                    {motivosOpciones.length > 0 ? (
                      motivosOpciones.map((motivo) => (
                        <MenuItem key={motivo.idMotivoBaja} value={motivo.idMotivoBaja}>
                          {motivo.motivoBaja}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No hay motivos disponibles
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
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
  idEstablecimiento: PropTypes.object,
  ruralidad: PropTypes.string,
  accionesDisponibles: PropTypes.arrayOf(PropTypes.string),
};
