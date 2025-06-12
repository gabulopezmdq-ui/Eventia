import { useState, useEffect } from "react";
import axios from "axios";

// Componentes de Material-UI
import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";

// Componentes de Material Dashboard 2 PRO React
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

import "../../Pruebas/pruebas.css";

function UsuariosEstablecimientos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [activoFilter, setActivoFilter] = useState("S"); // Estado inicial para "Vigente"
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchUsuariosEstablecimientos(); // Llama a la función para obtener los datos
  }, []);

  // Función para obtener datos desde la API
  const fetchUsuariosEstablecimientos = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "UsuariosEstablecimientos/getall", {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        setAllData(response.data); // Almacenar todos los datos
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

  // Función para filtrar datos según el filtro activo
  const filterData = (data, filter) => {
    let filteredData;
    if (filter === "S") {
      filteredData = data.filter((item) => item.vigente === "S" || item.vigente === true);
    } else if (filter === "N") {
      filteredData = data.filter((item) => item.vigente === "N" || item.vigente === false);
    } else {
      filteredData = data; // Todos los datos
    }
    setDataTableData(filteredData);
  };

  // Maneja el cambio de filtro
  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setActivoFilter(filter);
    filterData(allData, filter); // Aplicar el filtro a todos los datos
  };

  const handleNuevoTipo = () => {
    navigate("/UsuariosEstablecimientosFE/Nuevo");
  };

  const handleVer = (rowData) => {
    if (rowData && rowData.IdUsuarioEstablecimiento) {
      const productId = rowData.IdUsuarioEstablecimiento;
      const url = `/UsuariosEstablecimientosFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };

  const handleEditarUsuariosEstablecimientos = (idUsuarioEstablecimiento) => {
    const url = `/UsuariosEstablecimientosFE/Edit/${idUsuarioEstablecimiento}`;
    navigate(url);
  };

  const displayValue = (value) => (value ? value : "N/A");

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <MDButton variant="gradient" color="success" onClick={handleNuevoTipo}>
            Agregar
          </MDButton>
          <MDBox
            component="select"
            onChange={handleFilterChange} // Maneja cambios en el filtro
            value={activoFilter} // Valor inicial "Vigente"
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
        </MDBox>
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
          <Card>
            <DataTable
              table={{
                columns: [
                  { Header: "USUARIO.", accessor: "usuario.nombre" },
                  {
                    Header: "NRO. ESTABLECIMIENTO",
                    accessor: "establecimiento.nroEstablecimiento",
                  },
                  { Header: "DESCRIPCIÓN", accessor: "cargo.descripcion" },
                  {
                    Header: "VIGENTE",
                    accessor: (row) => (
                      <p>{row.vigente === "S" ? "SI" : row.vigente === "N" ? "NO" : "N/A"}</p>
                    ),
                  },
                  {
                    Header: "Editar",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() =>
                          handleEditarUsuariosEstablecimientos(
                            row.original.idUsuarioEstablecimiento
                          )
                        }
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

UsuariosEstablecimientos.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default UsuariosEstablecimientos;
