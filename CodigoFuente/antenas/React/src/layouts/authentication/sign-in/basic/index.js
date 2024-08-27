/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Divider } from "@mui/material";
// react-router-dom components
// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import jwt_decode from "jwt-decode";
// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";
import MDAlert from "components/MDAlert";

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  // Login como en foodtrucks

  const navigate = useNavigate();
  const [usuario, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [loading, setLoading] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);
    axios
      .post(
        process.env.REACT_APP_API_URL + "account/login",
        { usuario, password },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Credentials": true,
          },
        }
      )
      .then((response) => {
        sessionStorage.setItem("token", response.data.value.token); // Cambio a sessionStorage
        const decodedToken = jwt_decode(response.data.value.token);
        navigate("/PersonaFE");
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
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

  const onUsername = (e) => {
    setUsername(e.target.value);
  };

  const onPassword = (e) => {
    setPassword(e.target.value);
  };

  return (
    <>
      {errorAlert.show && (
        <Grid container justifyContent="center" mb={-15}>
          <Grid item xs={12} lg={8}>
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
      <BasicLayout>
        <Card>
          <MDBox
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
            mx={2}
            mt={-3}
            p={2}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Mecanizadas MGP
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <MDBox component="form" role="form" onSubmit={handleLogin}>
              <MDBox mb={2}>
                <MDInput label="Usuario" fullWidth value={usuario} onChange={onUsername} />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  type="password"
                  label="Password"
                  fullWidth
                  value={password}
                  onChange={onPassword}
                />
              </MDBox>
              {loading && (
                <Grid container justifyContent="center" pt={2}>
                  <CircularProgress color="info" size={25} />
                </Grid>
              )}
              <MDBox mt={4} mb={1}>
                <MDButton variant="gradient" type="submit" color="info" fullWidth>
                  iniciar sesión
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      </BasicLayout>
    </>
  );
}

export default Basic;
