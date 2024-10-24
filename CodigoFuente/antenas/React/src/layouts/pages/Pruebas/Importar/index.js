import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { Link, useNavigate } from "react-router-dom";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import Modal from "@mui/material/Modal";
import "../pruebas.css";

function Importar() {
  const navigate = useNavigate();
  const [dataTableData, setDataTableData] = useState([]);
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorExcel, setErrorExcel] = useState({ show: false, message: "", type: "error" });
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado
  const token = sessionStorage.getItem("token");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setIsFileSelected(!!file);
    setFileName(file ? file.name : "");
  };

  const uploadFile = () => {
    if (!selectedFile) {
      setErrorAlert({
        show: true,
        message: "Por favor, selecciona un archivo Excel.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryData = event.target.result;

      axios
        .post(process.env.REACT_APP_API_URL + "Personas", binaryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/octet-stream",
          },
        })
        .then((response) => {
          setErrorExcel({
            show: true,
            message: "Archivo enviado exitosamente.",
            type: "success",
          });
          setTimeout(() => {
            setErrorExcel({
              show: false,
              message: "",
              type: "success",
            });
          }, 3000);
          axios
            .get(process.env.REACT_APP_API_URL + "Personas", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              setDataTableData(response.data);
              setSelectedItem(null);
              localStorage.removeItem("selectedItem");
            })
            .catch((error) => {
              console.error("Error al obtener los datos actualizados:", error);
            });
          setSelectedFile(null);
          setIsFileSelected(false);
          setIsLoading(false);
          setFileName("");
        })
        .catch((error) => {
          console.error("Error al enviar el archivo al backend:", error);
          setErrorExcel({
            show: true,
            message: "Error al enviar el archivo.",
            type: "error",
          });
          setTimeout(() => {
            setErrorExcel({
              show: false,
              message: "",
              type: "error",
            });
          }, 3000);
          setIsLoading(false);
        });
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_URL + "Personas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setDataTableData(response.data);
        setSelectedItem(null);
        localStorage.removeItem("selectedItem");
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
          setErrorAlert({
            show: true,
            message: errorMessage,
            type: errorType,
          });
        } else {
          setErrorAlert({
            show: true,
            message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            type: "error",
          });
        }
      });
  }, []);

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <label htmlFor="file-upload">
            <MDButton variant="gradient" size="small" color="success" component="span">
              Subir Excel
            </MDButton>
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: "14px", marginLeft: "10px" }}>{fileName && `${fileName}`} </p>
        </div>
        <MDButton
          size="small"
          color="info"
          variant="gradient"
          onClick={uploadFile}
          disabled={!isFileSelected || isLoading}
          style={{ display: isFileSelected ? "block" : "none" }}
        >
          {isLoading ? "Enviando..." : "Enviar Excel"}
        </MDButton>
        {errorExcel.show && (
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={12}>
              <MDBox pt={2}>
                <MDAlert color={errorExcel.type} dismissible>
                  <MDTypography variant="body2" color="white">
                    {errorExcel.message}
                  </MDTypography>
                </MDAlert>
              </MDBox>
            </Grid>
          </Grid>
        )}
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
                  { Header: "Fecha Hora", accessor: "FechaHora" },
                  { Header: "Cuenta", accessor: "Cuenta" },
                  { Header: "Valuacion Auxiliar", accessor: "ValuacionAuxiliar" },
                  { Header: "Usuario", accessor: "Usuario" },
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

export default Importar;
