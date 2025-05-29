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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import StepLabel from "@mui/material/StepLabel";
import MDButton from "components/MDButton";
import Prueba from "../Formulario/components/Prueba";
import { red } from "@mui/material/colors";

function Formulario({
  steps,
  apiUrl,
  productId,
  idObra,
  includeIdRepTecnico,
  idAdministracion,
  idConservadora,
}) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const token = sessionStorage.getItem("token");
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const handleNext = () => setActiveStep(activeStep + 1);
  const handleBack = () => setActiveStep(activeStep - 1);
  const handleCancel = () => navigate(activeStep - 1);
  includeIdRepTecnico = includeIdRepTecnico || false;
  let apiGetbyId = includeIdRepTecnico
    ? process.env.REACT_APP_API_URL + `RespTecById?idEVConsEVRespTec=${productId}`
    : `${apiUrl}/getbyid?id=${productId}`;
  useEffect(() => {
    if (productId) {
      axios
        .get(apiGetbyId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          // Normaliza los datos, reemplazando null o undefined por un valor predeterminado
          const normalizedData = Object.fromEntries(
            Object.entries(response.data || {}).map(([key, value]) => [
              key,
              value !== null && value !== undefined ? value : "", // Usa un valor predeterminado como "" o 0
            ])
          );
          setFormData(normalizedData);
        })
        .catch((error) => {
          console.error("Error al cargar los datos del producto:", error);
        });
    }
  }, [apiUrl, productId]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const dataToSubmit = { ...formData };
    if (dataToSubmit.ordenPago) {
      dataToSubmit.ordenPago = dataToSubmit.ordenPago
        .replace(/\D/g, "")
        .padStart(5, "0")
        .slice(0, 5);
    }
    Object.keys(dataToSubmit).forEach((key) => {
      if (dataToSubmit[key] === null || dataToSubmit[key] === undefined) {
        dataToSubmit[key] = "";
      }
    });
    if (!productId && !dataToSubmit.vigente) {
      dataToSubmit.vigente = "S"; // Asegura que "vigente" se envíe como "S" en el alta
    }

    const requiredFields = currentStep.fields.filter((field) => field.required);
    const isFormValid = requiredFields.every((field) => formData[field.name]);
    const missingFields = requiredFields.filter((field) => !formData[field.name]);

    currentStep.fields.forEach((field) => {
      if (field.type === "checkbox" && !formData.hasOwnProperty(field.name)) {
        formData[field.name] = false;
      }
    });

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map((field) => field.name).join(", ");
      setAlertData({
        show: true,
        message: `Por favor complete los campos requeridos: ${missingFieldNames}`,
        type: "error",
      });
      return;
    }

    const customValidationErrors = currentStep.fields
      .filter((field) => field.customValidation)
      .map((field) => field.customValidation(formData[field.name], field))
      .filter((error) => error !== null);

    if (customValidationErrors.length > 0) {
      const errorMessages = customValidationErrors.join("\n");
      setAlertData({
        show: true,
        message: `Corrija los errores de validación específicos:\n${errorMessages}`,
        type: "error",
      });
      setTimeout(() => {
        setAlertData({
          show: false,
          message: "",
          type: "",
        });
      }, 4000);
      return;
    }

    if (idObra) {
      dataToSubmit.idObra = idObra;
    }
    if (idConservadora) {
      dataToSubmit.idConservadora = idConservadora;
    }
    if (idAdministracion) {
      dataToSubmit.idAdmin = idAdministracion;
      dataToSubmit.idCons = formData?.idConservadora || null;
    }
    if (!isFormValid) {
      alert("Por favor complete los campos");
      console.error("Por favor complete los campos requeridos.");
      return;
    }

    const hasArrayInObject = (obj) => {
      if (!obj || typeof obj !== "object") return false;
      return Object.values(obj).some((val) => Array.isArray(val));
    };
    const filteredFormData = Object.keys(dataToSubmit).reduce((acc, key) => {
      const value = dataToSubmit[key];
      if (value instanceof Date) {
        acc[key] = formatDateToString(value);
      } else if (!Array.isArray(value) && (typeof value !== "object" || !hasArrayInObject(value))) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formattedFDesde = formData.fDesde ? formatDate(new Date(formData.fDesde)) : null;
    const formattedFHasta = formData.fHasta ? formatDate(new Date(formData.fHasta)) : null;
    const apiUrlWithIdRepTecnico = includeIdRepTecnico
      ? `${apiUrl}?idCons=${formData.idConservadora}&idRepTec=${formData.idRepTecnico}&fDesde=${formattedFDesde}&fHasta=${formattedFHasta}&nroContrato=${formData.nroContrato}`
      : apiUrl;

    if (productId) {
      axios
        .put(apiUrlWithIdRepTecnico, filteredFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          navigate(-1);
        })
        .catch((error) => {
          console.error("Error en la respuesta del backend:", error); // Agregado para depuración

          // Verificar si el error es por registro duplicado
          if (error.response && error.response.status === 400) {
            const errorMessage = error.response.data.error;
            if (errorMessage && errorMessage.includes("El registro ya existe.")) {
              setAlertData({
                show: true,
                message: "El usuario ya se encuentra registrado.",
                type: "error",
              });
            } else {
              setAlertData({
                show: true,
                message: errorMessage || "Error desconocido.",
                type: "error",
              });
            }
          } else {
            setAlertData({
              show: true,
              message: "Hubo un error al procesar la solicitud.",
              type: "error",
            });
          }
        });
    } else {
      axios
        .post(apiUrlWithIdRepTecnico, filteredFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          navigate(-1);
        })
        .catch((error) => {
          console.error("Error en la respuesta del backend:", error); // Agregado para depuración

          // Verificar si el error es por registro duplicado
          if (error.response && error.response.status === 400) {
            const errorMessage = error.response.data.error;
            if (errorMessage && errorMessage.includes("El registro ya existe.")) {
              setAlertData({
                show: true,
                message: "El usuario ya se encuentra registrado.",
                type: "error",
              });
            } else {
              setAlertData({
                show: true,
                message: errorMessage || "Error desconocido.",
                type: "error",
              });
            }
          } else {
            setAlertData({
              show: true,
              message: "Ya se encuentra registrado.",
              type: "error",
            });
          }
        });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Limita el valor a un solo carácter si el campo es "codPcia" o "codFuncion"
    if ((name === "codPcia" || name === "codFuncion") && value.length > 1) {
      return; // Cancela el cambio si el usuario intenta ingresar más de un carácter
    }

    // Actualiza el estado, convirtiendo el valor a mayúsculas si es una cadena
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        name === "descripcion" || name === "leyendaTipoLiqReporte"
          ? value
          : typeof value === "string"
          ? value.toUpperCase()
          : value,
    }));
  };
  return (
    <MDBox mt={-9} mb={9}>
      {alertData.show && (
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={12}>
            <MDBox pt={2} mb={4}>
              <MDAlert
                color={alertData.type}
                dismissible
                onDismiss={() => setAlertData({ show: false, message: "", type: "info" })}
              >
                <MDTypography variant="body2" color="white">
                  {alertData.message}
                </MDTypography>
              </MDAlert>
            </MDBox>
          </Grid>
        </Grid>
      )}
      <Grid container justifyContent="center">
        <Grid item xs={12} lg={12}>
          <Card>
            <MDBox mt={-3} mb={3} mx={2}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </MDBox>
            <MDBox p={2}>
              <MDBox>
                <Prueba
                  formData={formData}
                  handleChange={handleChange}
                  fields={currentStep.fields}
                />
              </MDBox>
              <MDBox mt={3} width="100%" display="flex" justifyContent="space-between">
                {activeStep === 0 ? (
                  <MDBox />
                ) : (
                  <MDButton variant="gradient" color="light" onClick={handleBack}>
                    Atrás
                  </MDButton>
                )}
                <MDBox display="flex" gap={2}>
                  <MDButton variant="gradient" color="light" onClick={handleCancel}>
                    Cancelar
                  </MDButton>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={!isLastStep ? handleNext : handleSubmit}
                  >
                    {isLastStep ? "Enviar" : "Siguiente"}
                  </MDButton>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

Formulario.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  apiUrl: PropTypes.string.isRequired,
  productId: PropTypes.number,
  idObra: PropTypes.number,
  idConservadora: PropTypes.number,
  idAdministracion: PropTypes.number,
  includeIdRepTecnico: PropTypes.bool,
};
export default Formulario;
