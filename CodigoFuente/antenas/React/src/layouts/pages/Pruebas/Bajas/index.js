import { useState, useEffect } from "react";
import axios from "axios";

// Componentes de Material-UI
import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";

// Componentes de Material Dashboard 2 PRO React
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import DataTableBaja from "examples/Tables/DataTableBaja";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

// Otros imports
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import PropTypes from "prop-types";

import "../../Pruebas/pruebas.css";

function Bajas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableBajaData, setDataTableBajaData] = useState([]); // Arreglo vacío para evitar errores iniciales
  const [allData, setAllData] = useState([]); // Almacena todos los datos sin filtrar

  // Estados para los filtros de Nivel y Año
  const [nivelSeleccionado, setNivelSeleccionado] = useState("");
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [niveles, setNiveles] = useState([]);
  const [añosDisponibles, setAñosDisponibles] = useState([]);
  const [establecimientoSeleccionado, setEstablecimientoSeleccionado] = useState("");
  const [establecimientos, setEstablecimientos] = useState([]);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchMotivosBajas();
    fetchNiveles();
    generarAniosDisponibles();
    fetchEstablecimientos(); // 👈 nuevo
  }, []);

  // Función para obtener los datos desde la API
  const fetchMotivosBajas = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "MovimientosBaja/getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Mapeo para adaptar los datos a lo que espera el DataTable
        const mappedData = response.data.map((item) => ({
          idMovimientoBaja: item.idMovimientoBaja,
          descripcion: item.tipoEstablecimiento.descripcion, // Nivel
          secuencia: item.pof.secuencia || "N/A", // Secuencia
          apellido: `${item.pof.persona.apellido}, ${item.pof.persona.nombre}`,
          dni: item.pof.persona.dni, // DNI
          nroEstablecimiento: item.establecimiento.nroEstablecimiento, // Establecimiento
          fechaInicio: item.fechaInicio ? item.fechaInicio.split("T")[0] : "N/A", // Inicio
          fechaFin: item.fechaFin ? item.fechaFin.split("T")[0] : "N/A", // Fin
          cantHoras: item.cantHoras, // Cantidad de horas
          motivoBaja: item.motivoBajaDoc.motivoBaja, // Motivo baja
          estado: item.estado,
          ingreso: item.ingreso,
          // Se eliminó el campo 'vigente' ya que no se utilizará
        }));

        setAllData(mappedData);
        // Al cargar, mostramos todos los datos sin aplicar filtros adicionales
        setDataTableBajaData(mappedData);
      })
      .catch((error) => {
        if (error.response) {
          const statusCode = error.response.status;
          let errorMessage = "";
          let errorType = "error";
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema con la solicitud del cliente.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema en el servidor.`;
          }
          setErrorAlert({ show: true, message: errorMessage, type: errorType });
        } else {
          setErrorAlert({
            show: true,
            message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            type: "error",
          });
        }
      });
  };

  // Función para obtener los niveles desde la API
  const fetchNiveles = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "TiposEstablecimientos/getall", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        // Se espera que cada objeto tenga id y descripción
        const nivelesDescripcion = response.data.map((item) => ({
          id: item.idTipoEstablecimiento,
          descripcion: item.descripcion,
        }));
        setNiveles(nivelesDescripcion);
      })
      .catch((error) => {
        console.error("Error al obtener niveles:", error);
      });
  };

  // Función para generar la lista de años dinámicamente
  const generarAniosDisponibles = () => {
    const anioActual = new Date().getFullYear();
    const años = [];

    // 5 años anteriores
    for (let i = 5; i >= 1; i--) {
      años.push((anioActual - i).toString());
    }
    // Año actual y 1 año posterior
    años.push(anioActual.toString());
    años.push((anioActual + 1).toString());

    setAñosDisponibles(años);
  };

  // Función para filtrar los datos según Nivel y Año, se ejecuta al presionar el botón "Buscar"
  const filtrarDatos = () => {
    let filtrado = [...allData];

    if (nivelSeleccionado) {
      filtrado = filtrado.filter((item) => item.descripcion === nivelSeleccionado);
    }

    if (anioSeleccionado) {
      filtrado = filtrado.filter((item) => {
        const anioInicio = item.fechaInicio ? item.fechaInicio.split("-")[0] : "";
        return anioInicio === anioSeleccionado;
      });
    }
    if (establecimientoSeleccionado) {
      filtrado = filtrado.filter((item) => item.nroEstablecimiento === establecimientoSeleccionado);
    }

    setDataTableBajaData(filtrado);
  };
  // Función filtrar establecimiento
  const fetchEstablecimientos = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "Establecimientos/Getall", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const lista = response.data.map((item) => ({
          id: item.idEstablecimiento,
          nroEstablecimiento: item.nroEstablecimiento,
        }));
        setEstablecimientos(lista);
      })
      .catch((error) => {
        console.error("Error al obtener establecimientos:", error);
      });
  };

  // Función para navegar a nuevo registro
  const handleNuevoRegistroBaja = () => {
    navigate("/BajasFE/Nuevo");
  };

  // Función para navegar a ver el detalle
  const handleVer = (rowData) => {
    if (rowData && rowData.idMovimientoBaja) {
      const productId = rowData.idMovimientoBaja;
      navigate(`/BajasFE/${productId}`);
    } else {
      console.error("El objeto rowData o su propiedad 'idMovimientoBaja' no están definidos.");
    }
  };

  // Función para navegar a editar registro
  const handleEditarMotivosBajass = (idMovimientoBaja) => {
    navigate(`/BajasFE/Edit/${idMovimientoBaja}`);
  };

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        {errorAlert.show && (
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={12}>
              <MDBox pt={2}>
                <MDAlert color={errorAlert.type} dismissible>
                  <MDTypography variant="body2" color="white">
                    {errorAlert.message}
                  </MDTypography>
                </MDAlert>
              </MDBox>
            </Grid>
          </Grid>
        )}
        <MDBox my={3}>
          <Card sx={{ padding: 2 }}>
            <MDBox display="flex" justifyContent="center">
              <Grid container spacing={2} mb={2} justifyContent="center">
                {/* Combo de Nivel */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>NIVEL</InputLabel>
                    <Select
                      value={nivelSeleccionado}
                      onChange={(e) => setNivelSeleccionado(e.target.value)}
                      sx={{
                        height: "2.5rem",
                        backgroundColor: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {niveles.map((nivel) => (
                        <MenuItem key={nivel.id} value={nivel.descripcion}>
                          {nivel.descripcion}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Combo de Año */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>AÑO</InputLabel>
                    <Select
                      value={anioSeleccionado}
                      onChange={(e) => setAnioSeleccionado(e.target.value)}
                      sx={{
                        height: "2.5rem",
                        backgroundColor: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {añosDisponibles.map((anio) => (
                        <MenuItem key={anio} value={anio}>
                          {anio}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Combo de Establecimiento */}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>ESTABLECIMIENTO</InputLabel>
                    <Select
                      value={establecimientoSeleccionado}
                      onChange={(e) => setEstablecimientoSeleccionado(e.target.value)}
                      sx={{
                        height: "2.5rem",
                        backgroundColor: "white",
                        fontSize: "0.9rem",
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {establecimientos.map((est) => (
                        <MenuItem key={est.id} value={est.nroEstablecimiento}>
                          {est.nroEstablecimiento}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </MDBox>
            <Grid container spacing={2} mb={2} justifyContent="center">
              {/* Botón para agregar nuevo registro */}
              <Grid item xs={12} sm={6} md={5}>
                <MDButton
                  size="small"
                  component="span"
                  color="info"
                  onClick={handleNuevoRegistroBaja}
                  endIcon={<AddOutlinedIcon />}
                >
                  Nuevo Registro de Baja
                </MDButton>
              </Grid>

              {/* Botón Buscar que aplica el filtrado */}
              <Grid item xs={12} sm={6} md={5}>
                <MDButton
                  size="small"
                  component="span"
                  color="info"
                  onClick={filtrarDatos}
                  endIcon={<SearchOutlinedIcon />}
                >
                  Buscar
                </MDButton>
              </Grid>
            </Grid>
          </Card>
          <Card sx={{ mt: 3 }}>
            <DataTableBaja
              table={{
                columns: [
                  { Header: "Nivel", accessor: "descripcion" },
                  { Header: "Establec.", accessor: "nroEstablecimiento" },
                  { Header: "DNI", accessor: "dni" },
                  { Header: "SEC", accessor: "secuencia" },
                  { Header: "Apellido, Nombre", accessor: "apellido" },
                  { Header: "Inicio", accessor: "fechaInicio" },
                  { Header: "Fin", accessor: "fechaFin" },
                  { Header: "HS", accessor: "cantHoras" },
                  { Header: "Motivo", accessor: "motivoBaja" },
                  { Header: "Estado", accessor: "estado" },
                  { Header: "Ingreso", accessor: "ingreso" },
                  {
                    Header: "Editar",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleEditarMotivosBajass(row.original.idMovimientoBaja)}
                      >
                        Editar
                      </MDButton>
                    ),
                  },
                ],
                rows: dataTableBajaData,
              }}
              entriesPerPage={false}
              canSearch
              show
            />
          </Card>
        </MDBox>
      </DashboardLayout>
    </>
  );
}

Bajas.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default Bajas;
