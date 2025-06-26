// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

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
                  <TextField fullWidth type="number" label="Suplente Nro Documento" />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Apellido" />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Nombre" />
                </Grid>

                {/* Fechas */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Inicio"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth type="date" label="Fin" InputLabelProps={{ shrink: true }} />
                </Grid>

                {/* Cant Hs */}
                <Grid item xs={6}>
                  <TextField fullWidth type="number" label="Cant Hs" />
                </Grid>

                {/* Motivo */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Motivo</InputLabel>
                    <Select style={{ height: "2.5rem", backgroundColor: "white" }}>
                      <MenuItem value="1">Primario</MenuItem>
                      <MenuItem value="2">Secundario</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Estado */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select style={{ height: "2.5rem", backgroundColor: "white" }}>
                      <MenuItem value="1">Primario</MenuItem>
                      <MenuItem value="2">Secundario</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Ingreso */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Ingreso</InputLabel>
                    <Select style={{ height: "2.5rem", backgroundColor: "white" }}>
                      <MenuItem value="1">Primario</MenuItem>
                      <MenuItem value="2">Secundario</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Ingreso Descripción" />
                </Grid>

                {/* Observaciones */}
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Observaciones" />
                </Grid>

                {/* Vigente */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vigente</InputLabel>
                    <Select>
                      <MenuItem value="1">Primario</MenuItem>
                      <MenuItem value="2">Secundario</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <MDBox mt={2} sx={{ display: "flex" }}>
                <MDBox mr={2}>
                  <MDButton variant="gradient" color="success" size="small">
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
    </DashboardLayout>
  );
}

export default AltaRegistroBaja;
