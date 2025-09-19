// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { Snackbar, Alert } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AltaRegistroBaja() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [niveles, setNiveles] = useState([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");
  const [successAlert, setSuccessAlert] = useState(false);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [establecimientos, setEstablecimientos] = useState([]);
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [datosDocenteSeleccionado, setDatosDocenteSeleccionado] = useState(null);
  const [suplenteDni, setSuplenteDni] = useState("");
  const [suplenteApellido, setSuplenteApellido] = useState("");
  const [suplenteNombre, setSuplenteNombre] = useState("");
  const [camposSuplenteReadonly, setCamposSuplenteReadonly] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cantHoras, setCantHoras] = useState("");
  const [motivos, setMotivos] = useState([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
  const [estado, setEstado] = useState("P");
  const [ingreso, setIngreso] = useState(null);
  const [ingresoDescripcion, setIngresoDescripcion] = useState("NE");

  const token = sessionStorage.getItem("token");

  const fetchNiveles = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "TiposEstablecimientos/GetAll",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNiveles(response.data);
    } catch (error) {
      console.error("Error al obtener los niveles:", error);
    }
  };

  useEffect(() => {
    if (token) fetchNiveles();
  }, [token]);

  useEffect(() => {
    const anioActual = new Date().getFullYear();
    const anios = [];
    for (let i = anioActual - 5; i <= anioActual + 1; i++) anios.push(i);
    setAniosDisponibles(anios.reverse());
  }, []);

  const fetchEstablecimientos = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL + "Establecimientos/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEstablecimientos(response.data);
    } catch (error) {
      console.error("Error al obtener establecimientos:", error);
    }
  };

  useEffect(() => {
    if (token) fetchEstablecimientos();
  }, [token]);

  const fetchDocentesPOF = async (idEstablecimiento) => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL +
          `MovimientosBaja/GetPOF?idEstablecimiento=${idEstablecimiento}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocentes(response.data);
    } catch (error) {
      console.error("Error al obtener docentes de la POF:", error);
    }
  };

  const buscarSuplentePorDNI = async (dni) => {
    try {
      const response = await axios.get(process.env.REACT_APP_API_URL + "MovimientosBaja/Getall", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coincidencia = response.data.find(
        (mov) => String(mov.suplenteDNI).trim() === String(dni).trim()
      );

      if (coincidencia) {
        setSuplenteApellido(coincidencia.suplenteApellido);
        setSuplenteNombre(coincidencia.suplenteNombre);
        setCamposSuplenteReadonly(true);
      } else {
        setSuplenteApellido("");
        setSuplenteNombre("");
        setCamposSuplenteReadonly(false);
      }
    } catch (error) {
      console.error("Error al buscar suplente:", error);
    }
  };

  const handleDniChange = (e) => {
    const nuevoDni = e.target.value;
    setSuplenteDni(nuevoDni);
    if (nuevoDni.length >= 7) buscarSuplentePorDNI(nuevoDni);
  };

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "MotivosBajasDoc/GetAll", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setMotivos(response.data))
      .catch((error) => console.error("Error al obtener motivos:", error));
  }, [token]);

  useEffect(() => {
    if (!id) return;

    const fetchMovimiento = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API_URL + `MovimientosBaja/GetById?Id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;

        setSuplenteDni(data.suplenteDNI ?? "");
        setSuplenteApellido(data.suplenteApellido ?? "");
        setSuplenteNombre(data.suplenteNombre ?? "");
        setCamposSuplenteReadonly(!!data.suplenteDNI);

        setFechaInicio(data.fechaInicio?.split("T")[0] ?? "");
        setFechaFin(data.fechaFin?.split("T")[0] ?? "");
        setCantHoras(data.cantHoras ?? "");
        setEstado(data.estado ?? "P");
        setIngreso(data.ingreso ?? null);
        setIngresoDescripcion(data.ingresoDescripcion ?? "NE");

        setMotivoSeleccionado(data.idMotivoBaja ?? "");
        setAnioSeleccionado(data.anio ?? "");
        setNivelSeleccionado(data.idTipoEstablecimiento ?? "");

        if (data.establecimiento) {
          setEstablecimientoSeleccionado(data.establecimiento);
          fetchDocentesPOF(data.idEstablecimiento);
        }

        setDocenteSeleccionado(data.idPOF ?? "");
        setDatosDocenteSeleccionado(data.pof ?? null);
      } catch (error) {
        console.error("Error al cargar datos de edición:", error);
      }
    };

    fetchMovimiento();
  }, [id, token]);

  const handleSubmit = async () => {
    if (!docenteSeleccionado) {
      alert("Completa los campos obligatorios.");
      return;
    }
    if (!fechaInicio) {
      alert("La fecha de inicio es obligatoria.");
      return;
    }
    const movimiento = {
      ...(id && { idMovimientoBaja: Number(id) }),
      suplenteDni,
      suplenteApellido,
      suplenteNombre,
      fechaInicio,
      fechaFin,
      cantHoras: cantHoras ? Number(cantHoras) : null,
      estado,
      ingreso,
      ingresoDescripcion: ingreso ? "" : "NE",
      idMotivoBaja: motivoSeleccionado ? Number(motivoSeleccionado) : null,
      idEstablecimiento: establecimientoSeleccionado?.idEstablecimiento ?? null,
      idTipoEstablecimiento: nivelSeleccionado ? Number(nivelSeleccionado) : null,
      idPOF: docenteSeleccionado,
      anio: anioSeleccionado ? Number(anioSeleccionado) : null,
    };
    try {
      const url = process.env.REACT_APP_API_URL + "MovimientosBaja";
      const method = id ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: movimiento,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessAlert(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      alert("Error al registrar: " + errorMsg);
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {/* Nivel */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Nivel</InputLabel>
                    <Select
                      value={nivelSeleccionado}
                      onOpen={fetchNiveles}
                      onChange={(e) => setNivelSeleccionado(Number(e.target.value))}
                      style={{ height: "2.5rem", backgroundColor: "white" }}
                    >
                      {niveles.map((nivel) => (
                        <MenuItem
                          key={nivel.idTipoEstablecimiento}
                          value={nivel.idTipoEstablecimiento}
                        >
                          {nivel.descripcion}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Año */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Año</InputLabel>
                    <Select
                      value={anioSeleccionado}
                      onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                      style={{ height: "2.5rem", backgroundColor: "white" }}
                    >
                      {aniosDisponibles.map((anio) => (
                        <MenuItem key={anio} value={anio}>
                          {anio}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Establecimiento */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Establecimiento</InputLabel>
                    <Select
                      value={establecimientoSeleccionado?.idEstablecimiento || ""}
                      onChange={(e) => {
                        const est = establecimientos.find(
                          (est) => est.idEstablecimiento === e.target.value
                        );
                        setEstablecimientoSeleccionado(est);
                        fetchDocentesPOF(est.idEstablecimiento);
                      }}
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

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nro DIEGEP"
                    value={establecimientoSeleccionado?.nroDiegep || ""}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* Docente */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Docente</InputLabel>
                    <Select
                      label="Docente"
                      value={docenteSeleccionado}
                      onChange={(e) => {
                        const id = Number(e.target.value); // idPOF
                        setDocenteSeleccionado(id);
                        const seleccionado = docentes.find((d) => d.idPOF === id);
                        setDatosDocenteSeleccionado(seleccionado);
                      }}
                      renderValue={(selected) => {
                        if (!selected) return "Seleccione un docente"; // 👈 placeholder
                        const docente = docentes.find((d) => d.idPOF === selected);
                        return docente
                          ? `${docente.personaDNI} - ${docente.secuencia} - ${docente.personaApellido}, ${docente.personaNombre}`
                          : "";
                      }}
                      style={{ height: "2.5rem", backgroundColor: "white" }}
                    >
                      {docentes.map((doc) => (
                        <MenuItem key={doc.idPOF} value={doc.idPOF}>
                          {`${doc.personaDNI} - ${doc.secuencia} - ${doc.personaApellido}, ${doc.personaNombre}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Suplente */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Suplente Nro Documento"
                    value={suplenteDni}
                    onChange={handleDniChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={suplenteApellido}
                    onChange={(e) => setSuplenteApellido(e.target.value)}
                    InputProps={{ readOnly: camposSuplenteReadonly }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={suplenteNombre}
                    onChange={(e) => setSuplenteNombre(e.target.value)}
                    InputProps={{ readOnly: camposSuplenteReadonly }}
                  />
                </Grid>

                {/* Fechas */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Inicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fin"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Cant Hs */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cant. Hs."
                    value={cantHoras}
                    onChange={(e) => setCantHoras(e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {/* Motivo */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Motivo</InputLabel>
                    <Select
                      value={motivoSeleccionado}
                      onChange={(e) => setMotivoSeleccionado(Number(e.target.value))}
                      style={{ height: "2.5rem", backgroundColor: "white" }}
                    >
                      {motivos.map((motivo) => (
                        <MenuItem key={motivo.idMotivoBaja} value={motivo.idMotivoBaja}>
                          {motivo.motivoBaja}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Ingreso */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Ingreso</InputLabel>
                    <Select
                      value={ingreso}
                      onChange={(e) => {
                        const value = e.target.value;
                        setIngreso(value);
                        setIngresoDescripcion(value === null ? "NE" : value);
                      }}
                      style={{ height: "2.5rem", backgroundColor: "white" }}
                    >
                      <MenuItem value={null}>
                        <em>Ninguno</em>
                      </MenuItem>
                      <MenuItem value="ENERO">ENERO</MenuItem>
                      <MenuItem value="FEBRERO">FEBRERO</MenuItem>
                      <MenuItem value="MARZO">MARZO</MenuItem>
                      <MenuItem value="ABRIL">ABRIL</MenuItem>
                      <MenuItem value="MAYO">MAYO</MenuItem>
                      <MenuItem value="JUNIO">JUNIO</MenuItem>
                      <MenuItem value="JULIO">JULIO</MenuItem>
                      <MenuItem value="AGOSTO">AGOSTO</MenuItem>
                      <MenuItem value="SEPTIEMBRE">SEPTIEMBRE</MenuItem>
                      <MenuItem value="OCTUBRE">OCTUBRE</MenuItem>
                      <MenuItem value="NOVIEMBRE">NOVIEMBRE</MenuItem>
                      <MenuItem value="DICIEMBRE">DICIEMBRE</MenuItem>
                      <MenuItem value="SIN HABERES">SIN HABERES</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Ingreso Descripción"
                    value={ingreso ? "" : "NE"}
                    InputProps={{
                      readOnly: true, // siempre solo lectura
                    }}
                    disabled={!!ingreso} // si selecciona un ingreso, deshabilitado
                  />
                </Grid>
              </Grid>

              <MDBox mt={2} sx={{ display: "flex" }}>
                <MDBox mr={2}>
                  <MDButton variant="gradient" color="success" size="small" onClick={handleSubmit}>
                    Aceptar
                  </MDButton>
                </MDBox>
                <MDBox>
                  <MDButton
                    variant="gradient"
                    color="light"
                    size="small"
                    onClick={() => navigate(-1)}
                  >
                    Cancelar
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Snackbar
        open={successAlert}
        autoHideDuration={3000}
        onClose={() => setSuccessAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessAlert(false)} severity="success" sx={{ width: "100%" }}>
          Enviado correctamente
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default AltaRegistroBaja;
