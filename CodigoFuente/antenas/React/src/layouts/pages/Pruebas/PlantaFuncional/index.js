import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";

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
import DataTablePlanta from "examples/Tables/DataTablePlanta";
import "../../Pruebas/pruebas.css";

function PlantaFuncional() {
  const navigate = useNavigate();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const [nroEstablecimientos, setnroEstablecimientos] = useState([]); // Estado para los nroEstablecimientos
  const [selectednroEstablecimiento, setSelectednroEstablecimiento] = useState(""); // Estado para el nroEstablecimiento seleccionado
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Controla la visibilidad de DataTable
  const token = sessionStorage.getItem("token");

  // Fetch nroEstablecimientos when component mounts
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}Establecimientos/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Extrae nroEstablecimientos únicos del response
        const uniquenroEstablecimientos = [
          ...new Set(response.data.map((person) => person.nroEstablecimiento)),
        ];
        setnroEstablecimientos(uniquenroEstablecimientos);
      })
      .catch((error) => {
        setErrorAlert({
          show: true,
          message: "Error al cargar los nroEstablecimientos.",
          type: "error",
        });
      });
  }, [token]);

  // Fetch data for the selected nroEstablecimiento
  const handleSelectnroEstablecimiento = () => {
    if (!selectednroEstablecimiento) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona un nroEstablecimiento.",
        type: "error",
      });
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}Establecimientos/getall`, {
        params: { nroEstablecimiento: selectednroEstablecimiento }, // Envia el nroEstablecimiento seleccionado
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Asegúrate de que solo los datos filtrados se establecen aquí
        const filteredData = response.data.filter(
          (person) => person.nroEstablecimiento === selectednroEstablecimiento
        );
        setDataTableData(filteredData);
        setIsDataLoaded(true); // Mostrar la tabla cuando los datos están cargados
      })
      .catch((error) => {
        if (error.response) {
          const statusCode = error.response.status;
          let errorMessage = "";
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema con la solicitud del cliente.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Hubo un problema en el servidor.`;
          }
          setErrorAlert({ show: true, message: errorMessage, type: "error" });
        } else {
          setErrorAlert({
            show: true,
            message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            type: "error",
          });
        }
      });
  };

  const handleNuevoTipo = () => {
    navigate("/PlantaFuncionalFE/Nuevo");
  };

  const handleVer = (rowData) => {
    if (rowData && rowData.idPlantaFuncional) {
      const productId = rowData.idPlantaFuncional;
      const url = `/PlantaFuncionalFE/${productId}`;
      navigate(url);
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
        <MDBox my={3}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <MDBox>
                <select
                  value={selectednroEstablecimiento}
                  onChange={(e) => setSelectednroEstablecimiento(e.target.value)}
                  style={{ width: "100%", padding: "8px", color: "#495057" }}
                >
                  <option value="">Selecciona un Establecimiento</option>
                  {nroEstablecimientos.map((nroEstablecimiento, index) => (
                    <option key={index} value={nroEstablecimiento}>
                      {nroEstablecimiento}
                    </option>
                  ))}
                </select>
              </MDBox>
            </Grid>
            <Grid item xs={4}>
              <MDButton variant="gradient" color="info" onClick={handleSelectnroEstablecimiento}>
                Cargar
              </MDButton>
            </Grid>
          </Grid>
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
          {isDataLoaded && (
            <Card>
              <DataTablePlanta
                table={{
                  columns: [
                    { Header: "Numero de Establecimiento", accessor: "nroEstablecimiento" },
                    { Header: "Nombre Mgp", accessor: "nombreMgp" },
                    { Header: "Domicilio", accessor: "domicilio" },
                    { Header: "Telefono", accessor: "telefono" },
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
                  rows: dataTableData, // Usa los datos filtrados aquí
                }}
                entriesPerPage={false}
                canSearch
                show
              />
            </Card>
          )}
        </MDBox>
      </DashboardLayout>
    </>
  );
}

PlantaFuncional.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default PlantaFuncional;
