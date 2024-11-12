import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import "../../Pruebas/pruebas.css";

function TipoCategoria() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [activoFilter, setActivoFilter] = useState("S"); // Filtro por "Vigentes" por defecto
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchTipoCategorias(); // Llama a la función para obtener los datos
  }, []);

  // Función para obtener datos desde la API
  const fetchTipoCategorias = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "TiposCategorias/getall", {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        setAllData(response.data); // Guarda todos los datos
        filterData(response.data, "S"); // Aplica filtro inicial "Vigentes"
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

  // Función para filtrar los datos según el filtro activo
  const filterData = (data, filter) => {
    let filteredData;
    if (filter === "S") {
      // Filtra por "Vigentes" (S o true)
      filteredData = data.filter((item) => item.vigente === "S" || item.vigente === true);
    } else if (filter === "N") {
      // Filtra por "No Vigentes" (N o false)
      filteredData = data.filter((item) => item.vigente === "N" || item.vigente === false);
    } else {
      // Si es "Todos", no filtra
      filteredData = data;
    }
    setDataTableData(filteredData); // Actualiza los datos filtrados
  };

  // Maneja el cambio de filtro
  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setActivoFilter(filter);
    filterData(allData, filter); // Aplica el filtro a todos los datos
  };

  const handleNuevoTipo = () => {
    navigate("/TipoCategoriaFE/Nuevo");
  };

  const handleVer = (rowData) => {
    if (rowData && rowData.idTipoCategoria) {
      const productId = rowData.idTipoCategoria;
      const url = `/TipoCategoriaFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };
  const handleEditarTipoCategorias = (idTipoCategoria) => {
    const url = `/TipoCategoriasFE/Edit/${idTipoCategoria}`;
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
            value={activoFilter} // Valor inicial "Vigentes"
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
            <option value="S">Vigentes</option>
            <option value="N">No Vigentes</option>
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
                  { Header: "Cod Tipo Cat. Pcia.", accessor: "codCategoria" },
                  { Header: "Cod Cat. MGP", accessor: "codCategoriaMGP" },
                  { Header: "Descripción", accessor: "descripcion" },
                  { Header: "Vigente", accessor: "vigente" },
                  {
                    Header: "Editar",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleEditarTipoCategorias(row.original.idTipoCategoria)}
                      >
                        Editar
                      </MDButton>
                    ),
                  },
                ],
                rows: dataTableData, // Los datos filtrados
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

TipoCategoria.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default TipoCategoria;
