import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DetalleInasistencia from "./DetalleInasistencia/index";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

function VerificarInasistencia() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dataTableData, setDataTableData] = useState();
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const token = sessionStorage.getItem("token");
  const handleVerDetalle = (row) => {
    // Si vuelvo a tocar la misma fila, colapsa
    if (selectedRow && selectedRow.idCabecera === row.idCabecera) {
      setSelectedRow(null);
    } else {
      setSelectedRow(row);
    }
  };
  /*  useEffect(() => {
    const fetchCabecerasHabilitadas = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}inasistenciascabecera/CabecerasHabilitadas`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDataTableData(response.data);
      } catch (error) {
        console.error("Error al cargar las Cabeceras Habilitadas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCabecerasHabilitadas();
  }, [token]);*/
  useEffect(() => {
    setTimeout(() => {
      setDataTableData([
        {
          idCabecera: 1,
          establecimiento: "Escuela N°1",
          año: 2025,
          mes: "Septiembre",
          estado: "Habilitado",
          fechaEntrega: "2025-09-10",
          confecciono: "Juan Pérez",
        },
        {
          idCabecera: 2,
          establecimiento: "Escuela N°5",
          año: 2025,
          mes: "Agosto",
          estado: "Habilitado",
          fechaEntrega: "2025-08-28",
          confecciono: "María Gómez",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        {showAlert && (
          <MDAlert color={alertType} dismissible>
            <MDTypography variant="body2" color="white">
              {alertMessage}
            </MDTypography>
          </MDAlert>
        )}
        <MDBox mt={5}>
          {loading ? (
            <MDBox>
              <MDTypography variant="body2">Cargando...</MDTypography>
            </MDBox>
          ) : dataTableData.length === 0 ? (
            <MDBox mt={5}>
              <MDAlert color="warning" dismissible>
                <MDTypography variant="body2" color="white">
                  No hay <strong>Cabeceras Habilitadas</strong> disponibles.
                </MDTypography>
              </MDAlert>
            </MDBox>
          ) : (
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "Establecimiento", accessor: "establecimiento" },
                    { Header: "Año", accessor: "año" },
                    { Header: "Mes", accessor: "mes" },
                    { Header: "Estado", accessor: "estado" },
                    { Header: "Fecha Entrega", accessor: "fechaEntrega" },
                    { Header: "Confecciono", accessor: "confecciono" },
                    {
                      Header: "Acciones",
                      accessor: "edit",
                      Cell: ({ row }) => (
                        <MDBox display="flex" gap={1}>
                          <MDButton
                            variant="gradient"
                            color="info"
                            size="small"
                            onClick={() => handleVerDetalle(row.original)}
                          >
                            {selectedRow && selectedRow.idCabecera === row.original.idCabecera
                              ? "Ocultar Detalle"
                              : "Ver Detalle"}
                          </MDButton>
                        </MDBox>
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
          )}
        </MDBox>
        {selectedRow && (
          <DetalleInasistencia
            idCabecera={selectedRow.idCabecera}
            mes={selectedRow.mes}
            año={selectedRow.año}
          />
        )}
      </DashboardLayout>
    </>
  );
}

VerificarInasistencia.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default VerificarInasistencia;
