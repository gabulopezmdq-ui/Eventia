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
function CabeceraLiquidacion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState();
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "cabeceraliquidacion/getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const sortedData = response.data.sort((a, b) => {
          if (b.anioLiquidacion !== a.anioLiquidacion) {
            return b.anioLiquidacion - a.anioLiquidacion;
          }
          return b.mesLiquidacion - a.mesLiquidacion;
        });
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
  }, []);

  const handleNuevoTipo = () => {
    navigate("/CabeceraLiquidacionFE/Nuevo");
  };
  const handleVer = (rowData) => {
    if (rowData && rowData.idCabecera) {
      const productId = rowData.idCabecera;
      const url = `/VerCabeceraLiquidacionFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };
  const handleEditarCabeceraLiquidacion = (idCabecera) => {
    const url = `/CabeceraLiquidacionFE/Edit/${idCabecera}`;
    navigate(url);
  };
  const displayValue = (value) => (value ? value : "N/A");

  const estadoMapping = {
    P: "Pendiente Importación",
    I: "Archivo Importado",
    R: "Archivo Procesado",
    B: "Inasistencias / Bajas Procesado",
    L: "En Liquidación",
    C: "Liquidación cerrada",
  };

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
                  { Header: "Año Liquidacion", accessor: "anioLiquidacion" },
                  { Header: "Mes Liquidación", accessor: "mesLiquidacion" },
                  { Header: "Tipo Liquidacion", accessor: "tipoLiquidacion.descripcion" },
                  {
                    Header: "Estado",
                    accessor: "estado",
                    Cell: ({ value }) => estadoMapping[value] || "Desconocido",
                  },
                  {
                    Header: "Inicio Liquidacion",
                    accessor: "inicioLiquidacion",
                    Cell: ({ value }) =>
                      value ? new Date(value).toLocaleDateString("es-ES") : "N/A",
                  },
                  {
                    Header: "Fin Liquidacion",
                    accessor: "finLiquidacion",
                    Cell: ({ value }) =>
                      value ? new Date(value).toLocaleDateString("es-ES") : "N/A",
                  },
                  {
                    Header: "Editar",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleEditarCabeceraLiquidacion(row.original.idCabecera)}
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

CabeceraLiquidacion.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default CabeceraLiquidacion;
