import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { Link, useNavigate } from "react-router-dom";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Modal from "@mui/material/Modal";
import DataTable from "examples/Tables/DataTable";
import "../../Pruebas/pruebas.css";

function ResponsableTecnico() {
  const navigate = useNavigate();
  const [dataTableData, setDataTableData] = useState();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  useEffect(() => {
    axios
      .get("https://localhost:44382/repTecnico/GetAll")
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

  const formatDate = (dateString) => {
    const fecha = new Date(dateString);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return fecha.toLocaleDateString("es-ES", options);
  };

  const handleNuevoTipo = () => {
    navigate("/dashboards/ResponsableTecnico/Nuevo");
  };

  const handleOpenModal = (item) => {
    console.log("Tocaste el botón para ver el elemento:", item);
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };
  const handleEdicion = (rowData) => {
    if (rowData && rowData.idRepTecnico) {
      console.log("Editar datos:", rowData);
      const productId = rowData.idRepTecnico;
      console.log(productId);
      const url = `/dashboards/ResponsableTecnico/Edit/${productId}`;
      console.log("URL de redirección:", url);
      navigate(url);
      console.log("se paso la url");
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
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
                  //{ Header: "ID", accessor: "id" },
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Apellido", accessor: "apellido" },
                  { Header: "Mat. Municipal", accessor: "matMuni" },
                  { Header: "Mat. Profesional", accessor: "matProf" },
                  { Header: "Telefono", accessor: "telefono" },
                  {
                    Header: "Actualizado",
                    accessor: "fechaAct",
                    Cell: ({ row }) => <span>{formatDate(row.original.fechaAct)}</span>,
                  },
                  {
                    Header: "",
                    accessor: "ver",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleOpenModal(row.original)}
                      >
                        Ver
                      </MDButton>
                    ),
                  },
                  {
                    Header: "Edit",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <Link to={`/dashboards/ResponsableTecnico/Edit/${row.original.idRepTecnico}`}>
                        <MDButton
                          variant="gradient"
                          color="info"
                          onClick={() => handleEdicion(row.original)}
                        >
                          Edicion
                        </MDButton>
                      </Link>
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
      {isModalOpen && (
        <MDBox my={3}>
          <Modal open={isModalOpen} onClose={handleCloseModal}>
            <div className="modal-content">
              {selectedItem && (
                <Card className="Contenido">
                  <div className="tituloModal">
                    <MDTypography>Información Responsable Tecnico</MDTypography>
                  </div>
                  <hr />
                  <div className="cuerpoModal">
                    <MDTypography>
                      <b>Nombre:</b> {selectedItem.nombre}
                    </MDTypography>
                    <MDTypography>
                      <b>Apellido:</b> {selectedItem.apellido}
                    </MDTypography>
                    <MDTypography>
                      <b>Telefono:</b> {selectedItem.telefono}
                    </MDTypography>
                    <MDTypography>
                      <b>Mail:</b> {selectedItem.email}
                    </MDTypography>
                    <MDTypography>
                      <b>Mat. Prof:</b> {selectedItem.matProf}
                    </MDTypography>
                    <MDTypography>
                      <b>Mat. Municipal:</b> {selectedItem.matMuni}
                    </MDTypography>
                  </div>
                </Card>
              )}
            </div>
          </Modal>
        </MDBox>
      )}
    </>
  );
}

ResponsableTecnico.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default ResponsableTecnico;
