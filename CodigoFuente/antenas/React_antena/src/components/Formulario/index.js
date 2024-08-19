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

function Formulario({ steps, apiUrl, productId }) {
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
  useEffect(() => {
    if (productId) {
      console.log(productId);
      axios
        .get(`${apiUrl}/getbyid?id=${productId}`, {
          /*headers: {
            Authorization: `Bearer ${token}`, // Envía el token en los headers
          },*/
        })
        .then((response) => {
          setFormData(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar los datos del producto:", error);
        });
    }
  }, [apiUrl, productId]);

  const handleSubmit = (event) => {
    event.preventDefault();
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
      return;
    }

    if (!isFormValid) {
      // Mostrar un mensaje de error o realizar alguna acción
      alert("Por favor complete los campos");
      console.error("Por favor complete los campos requeridos.");
      return;
    }
    const filteredFormData = Object.keys(formData).reduce((acc, key) => {
      const value = formData[key];
      const hasArrayInObject = (obj) => {
        return Object.values(obj).some((val) => Array.isArray(val));
      };
      if (!Array.isArray(value) && (typeof value !== "object" || !hasArrayInObject(value))) {
        acc[key] = value;
      }
      return acc;
    }, {});
    console.log(filteredFormData);

    console.log(filteredFormData);
    if (productId) {
      axios
        .put(`${apiUrl}/`, filteredFormData, {
          /*headers: {
            Authorization: `Bearer ${token}`,
          },*/
        })
        .then((response) => {
          navigate(-1);
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            setAlertData({
              show: true,
              message: error.response.data.error,
              type: "error",
            });
            console.log("Error 400: " + error.response.data.error);
            setTimeout(() => {
              setAlertData({ show: false, message: "", type: "error" });
            }, 4000);
          } else {
            console.error("Error al enviar el formulario:", error);
          }
        });
    } else {
      axios
        .post(apiUrl, formData, {
          /*headers: {
            Authorization: `Bearer ${token}`,
          },*/
        })
        .then((response) => {
          navigate(-1);
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            setAlertData({
              show: true,
              message: error.response.data.error,
              type: "error",
            });
            console.log("Error 400: " + error.response.data.error);
            setTimeout(() => {
              setAlertData({ show: false, message: "", type: "error" });
            }, 4000);
          } else {
            console.error("Error al enviar el formulario:", error);
          }
        });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
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
                    back
                  </MDButton>
                )}
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={!isLastStep ? handleNext : handleSubmit} // Cambiar handleNext por handleSubmit en el botón "send"
                >
                  {isLastStep ? "send" : "next"}
                </MDButton>
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
};
export default Formulario;
