import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

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

function ImportarArchivo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState();
  const [nroEstablecimientos, setnroEstablecimientos] = useState([]);
  const [selectednroEstablecimiento, setSelectednroEstablecimiento] = useState("");
  const [file, setFile] = useState(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // Fetch Mecanizadas
    axios
      .get(`${process.env.REACT_APP_API_URL}CabeceraLiquidacion/GetAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const uniquenroEstablecimientos = [
          ...new Set(response.data.map((person) => person.observaciones)),
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

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "ImportarMecanizadas/GetAll")
      .then((response) => setDataTableData(response.data))
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
  }, []);

  const handleNuevoTipo = () => {
    navigate("/ImportarArchivoFE/Nuevo");
  };

  const handleVer = (rowData) => {
    if (rowData && rowData.idImportarArchivo) {
      const productId = rowData.idImportarArchivo;
      const url = `/ImportarArchivoFE/${productId}`;
      navigate(url);
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      setErrorAlert({ show: true, message: "Por favor, selecciona un archivo.", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("idCabecera", selectednroEstablecimiento);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}ImportarMecanizadas/ImportarExcel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setErrorAlert({ show: true, message: response.data, type: "success" });
      // Reload data or perform any additional actions
    } catch (error) {
      const errorMessage = error.response?.data || "Error al importar el archivo.";
      setErrorAlert({ show: true, message: errorMessage, type: "error" });
    }
  };

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
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <MDBox>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="select-establecimiento-label">
                    Selecciona un Establecimiento
                  </InputLabel>
                  <Select
                    labelId="select-establecimiento-label"
                    value={selectednroEstablecimiento}
                    onChange={(e) => setSelectednroEstablecimiento(e.target.value)}
                    label="Selecciona un Establecimiento"
                  >
                    <MenuItem value="">
                      <em>Selecciona un Establecimiento</em>
                    </MenuItem>
                    {nroEstablecimientos.map((nroEstablecimiento, index) => (
                      <MenuItem key={index} value={nroEstablecimiento}>
                        {nroEstablecimiento}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MDBox>
            </Grid>
            <Grid item xs={3}>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            </Grid>
            <Grid item xs={4}>
              <MDButton variant="gradient" color="info" onClick={handleImport}>
                Cargar
              </MDButton>
            </Grid>
          </Grid>
          <Card>
            <DataTable
              table={{
                columns: [
                  { Header: "Nombre", accessor: "nombre" },
                  { Header: "Apellido", accessor: "apellido" },
                  { Header: "Legajo", accessor: "legajo" },
                  { Header: "DNI", accessor: "dni" },
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

ImportarArchivo.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default ImportarArchivo;
