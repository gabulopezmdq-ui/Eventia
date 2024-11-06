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

function GestionUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const [activoFilter, setActivoFilter] = useState(true); // Estado para el filtro de activo, por defecto es true (activos)
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchUsuarios(); // Llama a la función para obtener datos al cargar el componente y cuando cambia el filtro
  }, [activoFilter]);

  const fetchUsuarios = () => {
    const url = `${process.env.REACT_APP_API_URL}Usuarios/GetByActivo`;

    // Si activoFilter es null, no pasamos parámetro, lo cual traerá todos los usuarios
    const params = activoFilter !== null ? { usuario: activoFilter } : {};

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params, // Si no es null, pasa el parámetro
      })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setDataTableData(data);
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
        setErrorAlert({
          show: true,
          message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
          type: "error",
        });
      });
  };

  // Maneja el cambio en el filtro de activo
  const handleFilterChange = (event) => {
    const value = event.target.value;
    if (value === "S") setActivoFilter(true); // Activos
    else if (value === "N") setActivoFilter(false); // Inactivos
    else setActivoFilter(null); // Todos
  };

  // Navega a la página de edición de usuario
  const handleEditarUsuario = (idUsuario) => {
    const url = `/GestionUsuariosFE/Edit/${idUsuario}`;
    navigate(url);
  };

  const handleNuevoTipo = () => {
    navigate("/GestionUsuarioFE/Nuevo");
  };

  // Función para que cuando el campo viene vacío muestre N/A
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
            onChange={handleFilterChange}
            defaultValue={activoFilter === null ? "" : activoFilter ? "S" : "N"}
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
            <option value="S">Activos</option>
            <option value="N">Inactivos</option>
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
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Email", accessor: "email" },
                  {
                    Header: "Editar",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleEditarUsuario(row.original.idUsuario)}
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

GestionUsuario.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    idUsuario: PropTypes.number,
  }),
};

export default GestionUsuario;
