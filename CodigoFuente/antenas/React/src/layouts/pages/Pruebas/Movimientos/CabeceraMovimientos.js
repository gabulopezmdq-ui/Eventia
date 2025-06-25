import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import GeneradorPDF from "./GeneradorPDF";
import "../../Pruebas/pruebas.css";

function CabeceraMovimientos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchConceptos();
  }, []);

  const fetchConceptos = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "MovimientosCabecera/GetAll", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos recibidos del backend:", response.data);
        setDataTableData(response.data);
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

  const handleNuevoMovimiento = () => {
    navigate("/CabeceraMovimientos/Nuevo");
  };

  const handleImprimir = async (movimiento) => {
    try {
      await GeneradorPDF.generar(movimiento);
    } catch (error) {
      setErrorAlert({
        show: true,
        message: "Error al generar el PDF",
        type: "error",
      });
    }
  };

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <MDButton variant="gradient" size="small" color="success" onClick={handleNuevoMovimiento}>
            Agregar
          </MDButton>
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
                  { Header: "Area", accessor: "area" },
                  { Header: "Año", accessor: "anio" },
                  { Header: "Mes", accessor: "mes" },
                  { Header: "Establecimiento", accessor: "establecimientos.nroEstablecimiento" },
                  {
                    Header: "Estado",
                    accessor: "estado",
                    Cell: ({ value }) => {
                      const estados = [
                        { label: "Pendiente", value: "P" },
                        { label: "Enviado a Educación", value: "E" },
                        { label: "Enviado a Provincia", value: "V" },
                      ];

                      const estadoEncontrado = estados.find((e) => e.value === value);
                      return estadoEncontrado ? estadoEncontrado.label : value;
                    },
                  },
                  {
                    Header: "Acciones",
                    accessor: "acciones",
                    Cell: ({ row }) => {
                      const estado = row.original.estado;

                      return (
                        <MDBox display="flex" gap={1}>
                          {(estado === "E" || estado === "P") && (
                            <MDButton
                              variant="gradient"
                              color="warning"
                              size="small"
                              onClick={() =>
                                navigate(
                                  `/CabeceraMovimientos/Edit/${row.original.idMovimientoCabecera}`
                                )
                              }
                            >
                              Editar
                            </MDButton>
                          )}
                          {estado === "E" && (
                            <MDButton
                              variant="gradient"
                              size="small"
                              color="secondary"
                              onClick={() => handleEnviarProvincia(row.original)}
                            >
                              Enviar a Provincia
                            </MDButton>
                          )}
                          {estado === "V" && (
                            <MDButton
                              variant="gradient"
                              size="small"
                              color="info"
                              onClick={() => handleImprimir(row.original)}
                            >
                              Imprimir
                            </MDButton>
                          )}
                        </MDBox>
                      );
                    },
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

CabeceraMovimientos.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default CabeceraMovimientos;
