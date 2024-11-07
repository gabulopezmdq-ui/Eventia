import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { Link, useNavigate, useParams } from "react-router-dom";
import { styled } from "@mui/system";
import { Typography } from "@mui/material";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
// Material Dashboard 2 PRO React examples
import bookingImage from "assets/images/imginicio.svg";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "../../Pruebas/pruebas.css";
const StyledCard = styled(Card)({
  padding: "20px",
});
function Inicio() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState();
  const token = sessionStorage.getItem("token");
  //Funcion para que cuando el campo viene vacio muestre N/A
  const displayValue = (value) => (value ? value : "N/A");

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
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
            <Grid container spacing={2} my={3}>
              {/* Columna Izquierda */}
              <Grid
                item
                xs={12}
                md={6}
                container
                direction="column"
                justifyContent="center" // Centrado verticalmente
                alignItems="center" // Centrado horizontalmente
                textAlign="center"
              >
                <Typography variant="h5" component="h2" gutterBottom>
                  Bienvenido al sistema de mecanizadas
                </Typography>
                <Typography my={3} variant="body1">
                  Aquí puedes gestionar todas tus operaciones de manera eficiente.
                </Typography>
              </Grid>

              {/* Columna Derecha */}
              <Grid item xs={12} md={6} display="flex" justifyContent="center" alignItems="center">
                <img
                  src={bookingImage} // Asegúrate de que la ruta sea correcta
                  alt="Imagen representativa"
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              </Grid>
            </Grid>
          </Card>
        </MDBox>
      </DashboardLayout>
    </>
  );
}

Inicio.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default Inicio;
