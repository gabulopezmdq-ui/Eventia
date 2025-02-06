import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import EditarModalAntiguedad from "../Persona/EditarModalAntiguedad";
import "../../Pruebas/pruebas.css";
function Persona() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState();
  const [activoFilter, setActivoFilter] = useState("S");
  const [allData, setAllData] = useState([]);
  const [isAntiguedadModalOpen, setIsAntiguedadModalOpen] = useState(false);
  const [selectedIdPof, setSelectedIdPof] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "Personas/getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const sortedData = response.data.sort((a, b) => {
          const apellidoA = a.apellido.toLowerCase();
          const apellidoB = b.apellido.toLowerCase();
          if (apellidoA < apellidoB) return -1;
          if (apellidoA > apellidoB) return 1;
          const nombreA = a.nombre.toLowerCase();
          const nombreB = b.nombre.toLowerCase();
          if (nombreA < nombreB) return -1;
          if (nombreA > nombreB) return 1;
          return 0;
        });
        setAllData(sortedData);
        filterData(sortedData, "S");
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
      filteredData = data;
    }
    setDataTableData(filteredData);
  };

  const handleFilterChange = (event) => {
    const filter = event.target.value;
    setActivoFilter(filter);
    filterData(allData, filter);
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

  const handleEditar = (idPersona) => {
    const url = `/PersonaFE/Edit/${idPersona}`;
    navigate(url);
  };

  const handleEditSuccess = () => {
    setShowAlert(true);
    setAlertMessage("¡Datos actualizados con éxito!");
    setAlertType("success");
    axios
      .get(process.env.REACT_APP_API_URL + "Personas/getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const sortedData = response.data.sort((a, b) => {
          const apellidoA = a.apellido.toLowerCase();
          const apellidoB = b.apellido.toLowerCase();
          if (apellidoA < apellidoB) return -1;
          if (apellidoA > apellidoB) return 1;
          const nombreA = a.nombre.toLowerCase();
          const nombreB = b.nombre.toLowerCase();
          if (nombreA < nombreB) return -1;
          if (nombreA > nombreB) return 1;
          return 0;
        });
        setAllData(sortedData);
        filterData(sortedData, activoFilter);
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

    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage("");
    }, 3000);
  };

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <MDButton variant="gradient" size="small" color="success" onClick={handleNuevoTipo}>
            Agregar
          </MDButton>
          <MDBox
            component="select"
            onChange={handleFilterChange}
            value={activoFilter}
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
        {showAlert && (
          <MDAlert color={alertType} dismissible>
            <MDTypography variant="body2" color="white">
              {alertMessage}
            </MDTypography>
          </MDAlert>
        )}
        <MDBox my={3}>
          <Card>
            <DataTable
              table={{
                columns: [
                  { Header: "Apellido", accessor: "apellido" },
                  { Header: "Nombre", accessor: "nombre" },
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
                      <>
                        <MDButton
                          variant="gradient"
                          color="info"
                          size="small"
                          onClick={() => handleEditar(row.original.idPersona)}
                        >
                          Editar
                        </MDButton>
                        <MDButton
                          variant="gradient"
                          color="secondary"
                          size="small"
                          style={{ marginLeft: "10px" }}
                          onClick={() => {
                            setSelectedIdPof(row.original.idPersona);
                            setIsAntiguedadModalOpen(true);
                          }}
                        >
                          Antigüedad
                        </MDButton>
                      </>
                    ),
                  },
                ],
                rows: dataTableData,
              }}
              entriesPerPage={false}
              canSearch
              show
            />
            <EditarModalAntiguedad
              isOpen={isAntiguedadModalOpen}
              onClose={() => setIsAntiguedadModalOpen(false)}
              idPersona={selectedIdPof}
              onEditSuccess={handleEditSuccess}
              token={token}
            />
          </Card>
        </MDBox>
      </DashboardLayout>
    </>
  );
}

Persona.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default Persona;
