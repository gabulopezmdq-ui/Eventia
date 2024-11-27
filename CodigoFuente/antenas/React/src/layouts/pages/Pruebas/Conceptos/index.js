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

function Conceptos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]); // Arreglo vacío para evitar errores iniciales
  const [activoFilter, setActivoFilter] = useState("S"); // Estado inicial para mostrar solo los vigentes
  const [allData, setAllData] = useState([]); // Almacena todos los datos sin filtrar
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchConceptos(); // Cargar los datos al montar el componente
  }, []);

  // Función para obtener los datos desde la API
  const fetchConceptos = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "Conceptos/getall", {
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

  const handleNuevoTipo = () => {
    navigate("/ConceptosFE/Nuevo");
  };

  const handleVer = (rowData) => {
    if (rowData && rowData.idConcepto) {
      const productId = rowData.idConcepto;
      const url = `/VerConceptoFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'idConcepto' no están definidos.");
    }
  };
  const handleEditarConceptos = (idConcepto) => {
    const url = `/ConceptosFE/Edit/${idConcepto}`;
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
                  { Header: "Cod Concepto Provincia", accessor: "codConcepto" },
                  { Header: "Cod Concepto MGP", accessor: "codConceptoMgp" },
                  { Header: "Descripción", accessor: "descripcion" },
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
                        onClick={() => handleEditarConceptos(row.original.idConcepto)}
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

Conceptos.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default Conceptos;
