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
import MDInput from "components/MDInput";

function PlantaFuncional() {
  const navigate = useNavigate();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]); // Para almacenar las personas
  const [nroEstablecimientos, setnroEstablecimientos] = useState([]); // Lista de establecimientos
  const [selectednroEstablecimiento, setSelectednroEstablecimiento] = useState(""); // Establecimiento seleccionado
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Controla la visibilidad de la tabla
  const token = sessionStorage.getItem("token"); // Token de sesión
  const [mostrarSoloDNI, setMostrarSoloDNI] = useState(false);

  // Fetch de todos los establecimientos al cargar el componente
  // Asumiendo que la respuesta contiene tanto 'idEstablecimiento' como 'nroEstablecimiento' (nombre)
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}Establecimientos/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // Extrae establecimientos con nombre y id
        const establecimientos = response.data;

        // Mapea a los ID y los nombres
        const uniqueEstablecimientos = establecimientos.map((establecimiento) => ({
          id: establecimiento.idEstablecimiento, // ID numérico
          nombre: establecimiento.nroEstablecimiento, // Nombre del establecimiento
        }));

        setnroEstablecimientos(uniqueEstablecimientos); // Guarda el listado completo
      })
      .catch((error) => {
        setErrorAlert({
          show: true,
          message: "Error al cargar los establecimientos.",
          type: "error",
        });
      });
  }, [token]);

  const handleSelectnroEstablecimiento = () => {
    if (!selectednroEstablecimiento) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona un nroEstablecimiento.",
        type: "error",
      });
      return;
    }

    // Usamos el ID directamente para la consulta
    const establecimientoId = selectednroEstablecimiento;

    axios
      .get(`${process.env.REACT_APP_API_URL}POF/GetByIdEstablecimiento`, {
        params: { IdEstablecimiento: establecimientoId }, // Se pasa el ID como parámetro
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const personas = response.data; // Personas asociadas
        setDataTableData(personas); // Asigna las personas al DataTable
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

  // Lógica para manejar la acción de agregar un nuevo tipo, directamente en el componente
  const handleNuevoTipoPof = () => {
    if (!selectednroEstablecimiento) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona un establecimiento antes de continuar.",
        type: "error",
      });
      return;
    }
    // Aquí puedes agregar la lógica para el establecimiento seleccionado
    // Por ejemplo, enviar una solicitud para agregar un nuevo tipo para este establecimiento
    const establecimientoId = selectednroEstablecimiento;
    console.log("ID del establecimiento seleccionado:", establecimientoId);
    // Cambiar el estado para mostrar solo los campos de DNI
    setMostrarSoloDNI(true);
  };

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
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
                  {/* Itera sobre los establecimientos y usa solo el 'nroEstablecimiento' como texto */}
                  {nroEstablecimientos.map((establecimiento, index) => (
                    <option key={index} value={establecimiento.id}>
                      {establecimiento.nombre} {/* Solo mostramos el nombre del establecimiento */}
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

          {/* Mostrar mensajes de error si existe uno */}
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

          {/* Mostrar la tabla con los datos cuando se han cargado */}
          {isDataLoaded && (
            <Card>
              <DataTablePlanta
                table={{
                  columns: [
                    {
                      Header: "Nombre de la Persona", // Cambiar título según los datos
                      accessor: (row) => row.persona.nombre, // Acceder a 'nombre' dentro del objeto 'persona'
                    },
                    {
                      Header: "Apellido", // Mostrar apellido
                      accessor: (row) => row.persona.apellido, // Acceder a 'apellido' dentro de 'persona'
                    },
                    /*{
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
                    },*/
                  ],
                  rows: dataTableData, // Los datos de las personas
                }}
                entriesPerPage={false}
                canSearch
                show
              />
              <MDButton variant="gradient" color="success" onClick={handleNuevoTipoPof}>
                Agregar
              </MDButton>
            </Card>
          )}
        </MDBox>
        {/*---------------------------------   POF   --------------------------------------------------*/}
        <Card sx={{ width: "90%", margin: "0 auto" }}>
          <MDBox>
            <MDBox width="80%" textAlign="center" mx="auto" my={4}>
              <MDBox mb={1}>
                <MDTypography variant="h5" fontWeight="regular">
                  Planta Organica Funcional (POF)
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox mt={2} mb={2}>
              <Grid container spacing={2}>
                <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                  <MDBox width="90%">
                    <MDInput variant="standard" label="dni" fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                  <MDButton variant="gradient" color="success" onClick={handleNuevoTipoPof}>
                    Consultar DNI
                  </MDButton>
                </Grid>
                <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                  <MDBox width="90%">
                    <MDInput variant="standard" label="Apellido" fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                  <MDBox width="90%">
                    <MDInput variant="standard" label="nombre" fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                  <MDBox width="90%">
                    <MDInput variant="standard" label="legajo" fullWidth />
                  </MDBox>
                </Grid>
                <Grid item xs={6} display="flex" justifyContent="center" alignItems="center">
                  <MDBox width="90%">
                    <MDInput variant="standard" label="vigente" fullWidth />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </MDBox>
        </Card>
        {/*---------------------------------   POF   --------------------------------------------------*/}
      </DashboardLayout>
    </>
  );
}

PlantaFuncional.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default PlantaFuncional;
