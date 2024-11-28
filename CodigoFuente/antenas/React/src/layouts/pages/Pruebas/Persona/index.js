import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { Link, useNavigate, useParams } from "react-router-dom";

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
function Persona() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState();
  const [activoFilter, setActivoFilter] = useState("S"); // Estado inicial para mostrar solo los vigentes
  const [allData, setAllData] = useState([]); // Almacena todos los datos sin filtrar
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "Personas/getall", {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
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
  }, []);
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

  const handleNuevoTipo = () => {
    navigate("/PersonaFE/Nuevo");
  };
  const handleVer = (rowData) => {
    if (rowData && rowData.idPersona) {
      const productId = rowData.idPersona;
      const url = `/PersonaFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };
  //Funcion para que cuando el campo viene vacio muestre N/A
  const displayValue = (value) => (value ? value : "N/A");

  const handleEditar = (idPersona) => {
    const url = `/PersonaFE/Edit/${idPersona}`;
    navigate(url);
  };

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
                  //{ Header: "ID", accessor: "id" },
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Apellido", accessor: "apellido" },
                  { Header: "Legajo", accessor: "legajo" },
                  { Header: "DNI", accessor: "dni" },
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
                        onClick={() => handleEditar(row.original.idPersona)}
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

Persona.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default Persona;
