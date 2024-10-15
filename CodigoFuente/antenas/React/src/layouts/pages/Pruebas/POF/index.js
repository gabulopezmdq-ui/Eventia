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

function POF() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState();
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "POF/getall", {
        //     headers: {
        //       Authorization: `Bearer ${token}`, // Envía el token en los headers
        //     },
      })
      .then((response) => setDataTableData(response.data))
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

  const handleNuevoTipo = () => {
    navigate("/POFFE/Nuevo");
  };
  const handleVer = (rowData) => {
    if (rowData && rowData.idTipoEstablecimiento) {
      const productId = rowData.idTipoEstablecimiento;
      const url = `/POFFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };
  //Funcion para que cuando el campo viene vacio muestre N/A
  const displayValue = (value) => (value ? value : "N/A");

  return (
    <>
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
                  //{ Header: "ID", accessor: "id" },
                  {
                    Header: "Persona",
                    accessor: (row) => {
                      const apellido = row.persona?.apellido || "Sin apellido";
                      const nombre = row.persona?.nombre || "Sin nombre";
                      return `${apellido}, ${nombre}`;
                    },
                  },
                  { Header: "Secuencia", accessor: "secuencia" },
                  { Header: "Barra", accessor: "barra" },
                  { Header: "Tipo Carga", accessor: "tipoCargo" },
                  { Header: "Cant. Hs.", accessor: "cantHsCargo" },
                  { Header: "Antig. Años", accessor: "antigAnios" },
                  { Header: "Antig. Meses", accessor: "antigMeses" },
                  {
                    Header: "Sin Haberes",
                    accessor: "sinHaberes",
                    Cell: ({ value }) => (value === "S" ? "SI" : "NO"),
                  },
                  {
                    Header: "Subvencionada",
                    accessor: "subvencionada",
                    Cell: ({ value }) => (value === "S" ? "SI" : "NO"),
                  },
                  {
                    Header: "Vigente",
                    accessor: "vigente",
                    Cell: ({ value }) => (value === "S" ? "SI" : "NO"),
                  },
                  {
                    Header: "Mas Info",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleVer(row.original)}
                      >
                        Mas Info
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

POF.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default POF;
