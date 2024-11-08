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

function UsuarioPorRol() {
  const navigate = useNavigate();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "RolesXUsuarios/getall", {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        // Ordena los datos alfabéticamente por 'nombreUsuario'
        const sortedData = response.data.sort((a, b) =>
          a.nombreUsuario.localeCompare(b.nombreUsuario)
        );
        setDataTableData(sortedData);
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
  }, [token]);

  const handleEditarUsuarioXRol = (idRolXUsuario) => {
    const url = `/UsuariosPorRolFE/Edit/${idRolXUsuario}`;
    navigate(url);
  };

  const handleNuevoTipo = () => {
    navigate("/UsuarioPorRolFE/Nuevo");
  };

  const handleVer = (rowData) => {
    if (rowData && rowData.idRolXUsuario) {
      const productId = rowData.idRolXUsuario;
      navigate(`/UsuarioPorRolFE/${productId}`);
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };

  // Función para que cuando el campo viene vacío muestre N/A
  const displayValue = (value) => (value ? value : "N/A");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDButton variant="gradient" color="success" onClick={handleNuevoTipo}>
        Agregar
      </MDButton>
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
                { Header: "Nombre", accessor: "nombreUsuario" },
                {
                  Header: "Rol",
                  accessor: "roles",
                  Cell: ({ cell }) => {
                    const roles = cell.value || []; // Usa un array vacío si cell.value es undefined
                    return roles.map((role) => role.nombreRol).join(", "); // Manejar el caso vacío
                  },
                },
                {
                  Header: "Editar",
                  accessor: "edit",
                  Cell: ({ row }) => (
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={() => handleEditarUsuarioXRol(row.original.idUsuario)}
                    >
                      Editar
                    </MDButton>
                  ),
                },
                /*{
                  Header: "Agregar Rol",
                  accessor: "AgregarRol",
                  Cell: ({ row }) => (
                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={() => handleNuevoTipoAgregarUsuario(row.original.idRolXUsuario)}
                    >
                      Agregar Rol
                    </MDButton>
                  ),
                },*/
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
  );
}

UsuarioPorRol.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default UsuarioPorRol;
