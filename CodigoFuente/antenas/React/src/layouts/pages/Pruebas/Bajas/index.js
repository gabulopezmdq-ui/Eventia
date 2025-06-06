import { useState, useEffect } from "react";
import axios from "axios";

// Componentes de Material-UI
import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

// Componentes de Material Dashboard 2 PRO React
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTableBaja from "examples/Tables/DataTableBaja";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import MDInput from "components/MDInput";

import "../../Pruebas/pruebas.css";

function Bajas() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]); // Arreglo vacío para evitar errores iniciales
  const [activoFilter, setActivoFilter] = useState("S"); // Estado inicial para mostrar solo los vigentes
  const [allData, setAllData] = useState([]); // Almacena todos los datos sin filtrar
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchMotivosBajass(); // Cargar los datos al montar el componente
  }, []);

  // Función para obtener los datos desde la API
  const fetchMotivosBajass = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos recibidos del backend:", response.data); // Depuración: ver datos originales
        setAllData(response.data); // Guardar todos los datos
        filterData(response.data, "S"); // Filtrar solo vigentes al inicio
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

  // Función para filtrar los datos según el filtro seleccionado
  const filterData = (data, filter) => {
    let filteredData;
    if (filter === "S") {
      filteredData = data.filter((item) => item.vigente === "S" || item.vigente === true);
    } else if (filter === "N") {
      filteredData = data.filter((item) => item.vigente === "N" || item.vigente === false);
    } else {
      filteredData = data; // Todos los datos
    }
    console.log("Datos filtrados:", filteredData); // Depuración: ver datos filtrados
    setDataTableData(filteredData);
  };

  // Maneja el cambio en el filtro de activo
  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setActivoFilter(filter); // Actualizar el estado del filtro
    filterData(allData, filter); // Filtrar los datos según el valor seleccionado
  };

  const handleNuevoRegistroBaja = () => {
    navigate("/BajasFE/Nuevo");
  };

  const handleVer = (rowData) => {
    if (rowData && rowData.idBajas) {
      const productId = rowData.idBajas;
      const url = `/BajasFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'idBajas' no están definidos.");
    }
  };
  const handleEditarMotivosBajass = (idBajas) => {
    const url = `/BajasFE/Edit/${idBajas}`;
    navigate(url);
  };
  useEffect(() => {
    // Datos de prueba (mockData)
    const mockData = [
      {
        Establec: "Escuela Nº 15",
        DNI: "12345678",
        SEC: "004",
        apellido: "González, María",
        Inicio: "2023-03-01",
        Fin: "2023-12-15",
        HS: "20",
        motivo: "Licencia médica",
        estado: "Activo",
        ingreso: "2023-02-20",
        idBajas: 1,
      },
      {
        Establec: "Escuela Nº 22",
        DNI: "87654321",
        SEC: "003",
        apellido: "Pérez, Juan",
        Inicio: "2024-03-01",
        Fin: "2024-12-15",
        HS: "18",
        motivo: "Renuncia",
        estado: "Inactivo",
        ingreso: "2024-01-10",
        idBajas: 2,
      },
    ];

    setDataTableData(mockData); // Cargar los datos mockeados
  }, []);

  const displayValue = (value) => (value ? value : "N/A");

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        {/*<MDBox display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <MDButton variant="gradient" color="success" onClick={handleNuevoTipo}>
            Agregar
          </MDButton>
          <MDBox
            component="select"
            onChange={handleFilterChange} // Llamar a la función al cambiar el filtro
            value={activoFilter} // Vincular el estado del filtro al valor del `select`
            sx={{
              padding: "10px 20px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              fontSize: "14px",
              backgroundColor: "#fff",
              "&:focus": {
                borderColor: "#4caf50",
              },
            }}
          >
            <option value="">Todos</option>
            <option value="S">Vigente</option>
            <option value="N">No Vigente</option>
          </MDBox>
        </MDBox>*/}
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
                {/* Filtro por Nivel */}
                <Grid item xs={12} sm={6} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>NIVEL</InputLabel>
                    <Select
                      sx={{
                        height: "2.5rem",
                        backgroundColor: "white",
                        minWidth: "100%", // Ocupa todo el ancho del contenedor Grid
                        fontSize: "0.9rem", // Opcional: tamaño de texto un poco más claro
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Primario">Primario</MenuItem>
                      <MenuItem value="Secundario">Secundario</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Filtro por Año */}
                <Grid item xs={12} sm={6} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>AÑO</InputLabel>
                    <Select
                      sx={{
                        height: "2.5rem",
                        backgroundColor: "white",
                        minWidth: "100%", // Ocupa todo el ancho del contenedor Grid
                        fontSize: "0.9rem", // Opcional: tamaño de texto un poco más claro
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="2023">2023</MenuItem>
                      <MenuItem value="2024">2024</MenuItem>
                      <MenuItem value="2025">2025</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </MDBox>
            {/*....................................................*/}
            <Grid container spacing={2} mb={2} justifyContent="center">
              {/* Filtro por Nivel */}
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

              {/* Filtro por Año */}
              <Grid item xs={12} sm={6} md={5}>
                <MDButton
                  size="small"
                  component="span"
                  color="info"
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
                  {
                    Header: "Nivel",
                    Cell: () => "Secundario", // Mostrará "Secundario" en todas las filas
                  },
                  { Header: "Establec.", accessor: "Establec" },
                  { Header: "DNI", accessor: "DNI" },
                  { Header: "SEC", accessor: "SEC" },
                  { Header: "Appellido, Nombre", accessor: "apellido" },
                  { Header: "Inicio", accessor: "Inicio" },
                  { Header: "Fin", accessor: "Fin" },
                  { Header: "HS", accessor: "HS" },
                  { Header: "Motivo", accessor: "motivo" },
                  { Header: "Estado", accessor: "estado" },
                  { Header: "Ingreso", accessor: "ingreso" },
                  {
                    Header: "Editar",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleEditarMotivosBajass(row.original.idBajas)}
                      >
                        Editar
                      </MDButton>
                    ),
                  },
                ],
                rows: dataTableData,
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
