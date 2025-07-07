// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { Snackbar, Alert } from "@mui/material";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Material Dashboard layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { useState, useEffect } from "react";
import axios from "axios";

// dentro de tu componente:
function AltaRegistroBaja() {
  const token = sessionStorage.getItem("token");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  // Selecccionar Nivel
  const [niveles, setNiveles] = useState([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");

  const fetchNiveles = async () => {
    try {
      const response = await axios.get("https://localhost:44382/TiposEstablecimientos/GetAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNiveles(response.data);
    } catch (error) {
      console.error("Error al obtener los niveles:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNiveles();
    } else {
      console.warn("No token found, user might not be logged in.");
    }
  }, [token]);
  // Selecccionar Año
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState("");

  useEffect(() => {
    const anioActual = new Date().getFullYear();
    const anios = [];
    for (let i = anioActual - 5; i <= anioActual + 1; i++) {
      anios.push(i);
    }
    setAniosDisponibles(anios.reverse()); // opcional: muestra el año más reciente primero
  }, []);
  // Establecimientos / Nro DIEGEP
  const [diegep, setDiegep] = useState("");
  const [establecimientos, setEstablecimientos] = useState([]);
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState(null);
  const fetchEstablecimientos = async () => {
    try {
      const response = await axios.get("https://localhost:44382/Establecimientos/GetAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEstablecimientos(response.data);
    } catch (error) {
      console.error("Error al obtener establecimientos:", error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchEstablecimientos();
    }
  }, [token]);
  // Obtener docentes
  const [docentes, setDocentes] = useState([]);
  const [datosDocenteSeleccionado, setDatosDocenteSeleccionado] = useState(null);
  const fetchDocentesPOF = async (idEstablecimiento) => {
    try {
      const response = await axios.get(
        `https://localhost:44382/MovimientosBaja/GetPOF?idEstablecimiento=${idEstablecimiento}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDocentes(response.data);
    } catch (error) {
      console.error("Error al obtener docentes de la POF:", error);
    }
  };

  //Suplente DNI
  const [suplenteDni, setSuplenteDni] = useState("");
  const [suplenteApellido, setSuplenteApellido] = useState("");
  const [suplenteNombre, setSuplenteNombre] = useState("");
  const [camposSuplenteReadonly, setCamposSuplenteReadonly] = useState(false);

  const buscarSuplentePorDNI = async (dni) => {
    try {
      const response = await axios.get("https://localhost:44382/MovimientosBaja/Getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const registros = response.data;
      const coincidencia = registros.find((mov) => mov.suplenteDNI.trim() === dni.trim());

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

    if (nuevoDni.length >= 7) {
      buscarSuplentePorDNI(nuevoDni);
    }
  };

  // Fecha Inicio
  const [fechaInicio, setFechaInicio] = useState("");
  // Fecha Fin
  const [fechaFin, setFechaFin] = useState("");
  // Cantidad de horas
  const [cantHoras, setCantHoras] = useState("");
  // Buscar Motivos Baja
  const [motivos, setMotivos] = useState([]);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState("");

  useEffect(() => {
    axios
      .get("https://localhost:44382/MotivosBajasDoc/GetAll")
      .then((response) => {
        setMotivos(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener motivos:", error);
      });
  }, []);

  //Estado
  const [estado, setEstado] = useState("PENDIENTE"); // Valor por defecto

  //Ingreso meses
  const [ingreso, setIngreso] = useState(null); // Por defecto null
  const [ingresoDescripcion, setIngresoDescripcion] = useState("NE");

  const handleSubmit = async () => {
    if (!suplenteDni || !suplenteApellido || !suplenteNombre || !docenteSeleccionado) {
      alert("Completa los campos obligatorios.");
      return;
    }

    const nuevoMovimiento = {
      baja: {
        suplenteDNI: suplenteDni,
        suplenteApellido: suplenteApellido,
        suplenteNombre: suplenteNombre,
        fechaInicio,
        fechaFin,
        cantHoras,
        estado,
        ingreso,
        ingresoDescripcion,
        idMotivoBaja: motivoSeleccionado,
        idEstablecimiento: establecimientoSeleccionado?.idEstablecimiento,
        idTipoEstablecimiento: nivelSeleccionado,
        idPOF: docenteSeleccionado,
        anio: anioSeleccionado,
      },
    };
    try {
      const response = await fetch("https://localhost:44382/MovimientosBaja", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoMovimiento),
      });

      if (response.ok) {
        setSuccessAlert(true);
        // Limpiar campos
        setSuplenteDni("");
        setSuplenteApellido("");
        setSuplenteNombre("");
        setFechaInicio("");
        setFechaFin("");
        setCantHoras("");
        setEstado("PENDIENTE");
        setIngreso(null);
        setIngresoDescripcion("NE");
        setMotivoSeleccionado("");
        setDocenteSeleccionado(null);
        setDatosDocenteSeleccionado(null);
      } else {
        const error = await response.text();
        alert("Error al registrar: " + error);
      }
    } catch (error) {
      alert("Error de conexión: " + error.message);
    }
  };

  // Aler y limpiar
  const [successAlert, setSuccessAlert] = useState(false);

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
                      onOpen={fetchNiveles} // ⚡️ llama al GET al abrir el select
                      onChange={(e) => setNivelSeleccionado(e.target.value)}
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
                      onChange={(e) => setAnioSeleccionado(e.target.value)}
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
                        setDiegep(est?.nroDiegep || ""); // si usás un estado para el campo diegep
                        fetchDocentesPOF(est.idEstablecimiento); // ⚡️ Traer docentes POF
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
                      value={docenteSeleccionado ?? ""} // docenteSeleccionado será string o null
                      onChange={(e) => {
                        const id = e.target.value; // es string
                        setDocenteSeleccionado(id);
                        const seleccionado = docentes.find((d) => String(d.id) === id);
                        setDatosDocenteSeleccionado(seleccionado);
                      }}
                      style={{ height: "2.5rem", backgroundColor: "white" }}
                    >
                      {docentes.map((doc) => (
                        <MenuItem key={doc.id} value={String(doc.id)}>
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
                    inputProps={{ min: 0 }} // Opcional: evita valores negativos
                  />
                </Grid>

                {/* Motivo */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Motivo</InputLabel>
                    <Select
                      value={motivoSeleccionado}
                      onChange={(e) => setMotivoSeleccionado(e.target.value)}
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

                {/* Estado */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      style={{ height: "2.5rem", backgroundColor: "white" }}
                    >
                      <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                      <MenuItem value="HECHO">HECHO</MenuItem>
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
                        setIngresoDescripcion(value !== null ? null : "NE");
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
                    value={ingresoDescripcion ?? ""}
                    InputProps={{
                      readOnly: true,
                    }}
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
                  <MDButton variant="gradient" color="light" size="small">
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
