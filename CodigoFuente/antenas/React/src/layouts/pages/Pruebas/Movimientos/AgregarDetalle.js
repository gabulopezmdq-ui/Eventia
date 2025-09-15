import React, { useState, useEffect } from "react";
import { Grid, TextField, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";

export default function AgregarDetalle({
  idCabecera,
  onSubmit,
  ruralidad,
  idEstablecimiento,
  accionesDisponibles = [],
}) {
  const [observacionSeleccionada, setObservacionSeleccionada] = useState("");
  const [observacionesFiltradas, setObservacionesFiltradas] = useState([]);
  const [observacionesOpciones, setObservacionesOpciones] = useState([]);
  const [funcionesOpciones, setFuncionesOpciones] = useState([]);
  const [docentesOpciones, setDocentesOpciones] = useState([]);
  const [errors, setErrors] = useState({});
  const [categoriasOpciones, setCategoriasOpciones] = useState([]);
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
    idTipoFuncion: "",
    tipoDoc: "",
    apellido: "",
    nombre: "",
    idTipoCategoria: "",
    docente: "",
    idPOF: "",
    fechaInicioBaja: "",
    fechaFinBaja: "",
    idMotivoBaja: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = () => {
    console.log("Entre a la peticion");
    const noRequeridos = ["horas", "antigAnos", "antigMeses"];

    // Campos que no aplican en cada flujo
    if (isAlta) {
      noRequeridos.push("idPOF", "docente", "idMotivoBaja", "fechaFinBaja", "fechaInicioBaja");
    } else if (isModiAdic) {
      noRequeridos.push("idMotivoBaja", "fechaFinBaja", "fechaInicioBaja", "tipoDoc");
    } else if (isBaja) {
      noRequeridos.push("turno", "sitRevista", "tipoDoc");
    }

    let newErrors = {};
    Object.keys(form).forEach((campo) => {
      if (!noRequeridos.includes(campo)) {
        if (form[campo] === "" || form[campo] === null || form[campo] === undefined) {
          newErrors[campo] = "Este campo es requerido";
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log("Errores encontrados:", newErrors);
      return; // No enviamos si hay errores
    }

    const formData = { ...form };

    if (isBajaOModifOAdic) {
      formData.idPOF = form.idPOF;
      formData.tipoDoc = "4";
      delete formData.docente;
    } else if (isAlta) {
      delete formData.idPOF;
      delete formData.docente;
      delete formData.idMotivoBaja;
      delete formData.fechaFinBaja;
      delete formData.fechaInicioBaja;
    }
    if (isModiAdic) {
      delete formData.idMotivoBaja;
      delete formData.fechaFinBaja;
      delete formData.fechaInicioBaja;
    }
    if (isModificacion) {
      formData.horasModulos = form.horasModulos;
      formData.cantidadHrasDecrece = form.cantidadHrasDecrece;
    }

    formData.idMovimientoCabecera = idCabecera;
    console.log("Enviando formData", formData);
    onSubmit(formData);
  };

  const isAlta = form.tipoMovimiento === "A";
  const isBajaOModifOAdic = ["B", "M", "D"].includes(form.tipoMovimiento);
  const isBaja = form.tipoMovimiento === "B";
  const isModiAdic = ["M", "D"].includes(form.tipoMovimiento);
  const isModificacion = ["M"].includes(form.tipoMovimiento);
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

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(process.env.REACT_APP_API_URL + "TiposCategorias/GetAll", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCategoriasOpciones(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchFunciones = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(process.env.REACT_APP_API_URL + "TiposFunciones/GetAll", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setFuncionesOpciones(data);
      } catch (error) {
        console.error("Error al cargar funciones:", error);
      }
    };

    fetchFunciones();
  }, []);

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

  const turno = [
    { value: "M", label: "Mañana" },
    { value: "T", label: "Tarde" },
    { value: "N", label: "Noche" },
  ];

  const documentoOpciones = [
    { value: 1, label: "Lib. Enrolamiento" },
    { value: 2, label: "Lib. Cívica" },
    { value: 3, label: "Ced. Identidad" },
    { value: 4, label: "DNI" },
  ];

  return (
    <MDBox pb={3} px={3}>
      <Card>
        <Grid container spacing={3} p={2}>
          {/* Tipo Movimiento */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth error={!!errors.tipoMovimiento}>
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
              {errors.tipoMovimiento && (
                <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.tipoMovimiento}</p>
              )}
            </FormControl>
          </Grid>

          {/* Alta */}
          {isAlta && (
            <>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={!!errors.tipoDoc}>
                  <InputLabel id="tipo-doc-label">Tipo Doc.</InputLabel>
                  <Select
                    labelId="tipo-doc-label"
                    id="tipo-doc"
                    name="tipoDoc"
                    label="Tipo Doc."
                    value={form.tipoDoc}
                    onChange={handleChange}
                    style={{ height: "2.8rem", backgroundColor: "white" }}
                  >
                    {documentoOpciones.map((opcion) => (
                      <MenuItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipoDoc && (
                    <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.tipoDoc}</p>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="numDoc"
                  label="Nro"
                  fullWidth
                  onChange={handleChange}
                  error={!!errors.numDoc}
                  helperText={
                    errors.numDoc && (
                      <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.numDoc}</p>
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="apellido"
                  label="Apellido"
                  fullWidth
                  value={form.apellido}
                  onChange={handleChange}
                  error={!!errors.apellido}
                  helperText={
                    errors.apellido && (
                      <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.apellido}</p>
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  name="nombre"
                  label="Nombre"
                  fullWidth
                  value={form.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={
                    errors.nombre && (
                      <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.nombre}</p>
                    )
                  }
                />
              </Grid>
            </>
          )}

          {/* Baja, Modif, Adic */}
          {isBajaOModifOAdic && (
            <>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.docente}>
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
                        idPOF: docenteSeleccionado.idPOF,
                        nombre: docenteSeleccionado.personaNombre,
                        apellido: docenteSeleccionado.personaApellido,
                        idTipoFuncion: docenteSeleccionado.idTipoFuncion || "",
                        numDoc: docenteSeleccionado.personaDNI || "",
                        antigAnos: docenteSeleccionado.anioAntiguedad || "",
                        antigMeses: docenteSeleccionado.mesAntiguedad || "",
                        funcion:
                          funcionesOpciones.find(
                            (f) => f.idTipoFuncion === docenteSeleccionado.idTipoFuncion
                          )?.codFuncion || "",
                        idTipoCategoria: docenteSeleccionado.idCategoria || "",
                        categoria:
                          categoriasOpciones.find(
                            (cat) => cat.idTipoCategoria === docenteSeleccionado.idCategoria
                          )?.codCategoria || "",
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
                  {errors.docente && (
                    <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.docente}</p>
                  )}
                </FormControl>
              </Grid>
              {isModiAdic && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.sitRevista}>
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
                            {opcion.label} ({opcion.value})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.sitRevista && (
                        <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.sitRevista}</p>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.funcion}>
                      <InputLabel>Función</InputLabel>
                      <Select
                        name="idTipoFuncion"
                        label="Función"
                        value={form.idTipoFuncion}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const funcionObj = funcionesOpciones.find(
                            (f) => f.idTipoFuncion === selectedId
                          );
                          setForm((prev) => ({
                            ...prev,
                            idTipoFuncion: selectedId,
                            funcion: funcionObj?.codFuncion || "",
                          }));
                        }}
                        style={{ height: "2.8rem", backgroundColor: "white" }}
                      >
                        {funcionesOpciones.length > 0 ? (
                          funcionesOpciones.map((funcion) => (
                            <MenuItem key={funcion.idTipoFuncion} value={funcion.idTipoFuncion}>
                              {funcion.codFuncion}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            No hay funciones disponibles
                          </MenuItem>
                        )}
                      </Select>
                      {errors.funcion && (
                        <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.funcion}</p>
                      )}
                    </FormControl>
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
                    <FormControl fullWidth error={!!errors.turno}>
                      <InputLabel>Turno</InputLabel>
                      <Select
                        name="turno"
                        label="Turno"
                        value={form.turno}
                        onChange={handleChange}
                        style={{ height: "2.8rem", backgroundColor: "white" }}
                      >
                        {turno.map((opcion) => (
                          <MenuItem key={opcion.value} value={opcion.value}>
                            {opcion.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.turno && (
                        <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.turno}</p>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.categoria}>
                      <InputLabel>Categoría</InputLabel>
                      <Select
                        name="idTipoCategoria"
                        label="Categoría"
                        value={form.idTipoCategoria}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const categoriaObj = categoriasOpciones.find(
                            (cat) => cat.idTipoCategoria === selectedId
                          );
                          setForm((prev) => ({
                            ...prev,
                            idTipoCategoria: selectedId,
                            categoria: categoriaObj?.codCategoria || "",
                          }));
                        }}
                        style={{ height: "2.8rem", backgroundColor: "white" }}
                      >
                        {categoriasOpciones.length > 0 ? (
                          categoriasOpciones.map((cat) => (
                            <MenuItem key={cat.idTipoCategoria} value={cat.idTipoCategoria}>
                              {cat.codCategoria}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            No hay categorías disponibles
                          </MenuItem>
                        )}
                      </Select>
                      {errors.categoria && (
                        <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.categoria}</p>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="horas"
                      label="Horas"
                      type="number"
                      fullWidth
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      name="antigAnos"
                      label="Antig. Años"
                      fullWidth
                      disabled={isBajaOModifOAdic}
                      value={form.antigAnos}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      name="antigMeses"
                      label="Antig. Meses"
                      fullWidth
                      value={form.antigMeses}
                      disabled={isBajaOModifOAdic}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
          {/* Observaciones predefinidas */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.observaciones}>
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
              {errors.observaciones && (
                <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.observaciones}</p>
              )}
            </FormControl>
          </Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <TextField
              name="observaciones"
              label="Observaciones"
              fullWidth
              multiline
              rows={3}
              value={form.observaciones}
              onChange={handleChange}
              error={!!errors.observaciones}
              helperText={
                errors.observaciones && (
                  <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.observaciones}</p>
                )
              }
            />
          </Grid>
          {isModificacion && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.decrece}>
                  <InputLabel>Decrece</InputLabel>
                  <Select
                    name="decrece"
                    label="Decrece"
                    value={form.decrece || ""}
                    onChange={handleChange}
                    style={{ height: "2.8rem", backgroundColor: "white" }}
                  >
                    <MenuItem value="S">Sí</MenuItem>
                    <MenuItem value="N">No</MenuItem>
                  </Select>
                  {errors.decrece && (
                    <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.decrece}</p>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="horasDecrece"
                  label="Horas/Módulos"
                  type="number"
                  fullWidth
                  value={form.horasDecrece || ""}
                  onChange={handleChange}
                  error={!!errors.horasDecrece}
                  helperText={
                    errors.horasDecrece && (
                      <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.horasDecrece}</p>
                    )
                  }
                />
              </Grid>
            </>
          )}
          {/* Baja */}
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
                  error={!!errors.fechaInicioBaja}
                  helperText={
                    errors.fechaInicioBaja && (
                      <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.fechaInicioBaja}</p>
                    )
                  }
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
                  error={!!errors.fechaFinBaja}
                  helperText={
                    errors.fechaFinBaja && (
                      <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.fechaFinBaja}</p>
                    )
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.motivoBaja}>
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
                  {errors.motivoBaja && (
                    <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.motivoBaja}</p>
                  )}
                </FormControl>
              </Grid>
            </>
          )}

          {/* Botón */}
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
  idCabecera: PropTypes.number,
  idEstablecimiento: PropTypes.object,
  ruralidad: PropTypes.string,
  accionesDisponibles: PropTypes.arrayOf(PropTypes.string),
};
