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
import StepLabel from "@mui/material/StepLabel";
import MDButton from "components/MDButton";
import Prueba from "../Formulario/components/Prueba";

function Formulario({ steps, apiUrl, productId, idObra }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => setActiveStep(activeStep + 1);
  const handleBack = () => setActiveStep(activeStep - 1);

  useEffect(() => {
    // Cargar datos del producto si tiene Id
    console.log(productId);
    if (productId) {
      axios
        .get(`${apiUrl}/getbyid?id=${productId}`)
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
    currentStep.fields.forEach((field) => {
      if (field.type === "checkbox" && !formData.hasOwnProperty(field.name)) {
        formData[field.name] = false;
      }
    });

    if (idObra) {
      formData.idObra = idObra;
    }

    if (!isFormValid) {
      // Mostrar un mensaje de error o realizar alguna acción
      alert("Por favor complete los campos");
      console.error("Por favor complete los campos requeridos.");
      return;
    }
    if (productId) {
      axios
        .put(`${apiUrl}/`, formData)
        .then((response) => {
          console.log("Producto editado:", response.data);
          navigate(-2); // Volver a la pantalla anterior
        })
        .catch((error) => {
          console.error("Error al editar el producto:", error);
        });
    } else {
      axios
        .post(apiUrl, formData)
        .then((response) => {
          console.log("Producto creado:", response.data);
          console.log("Producto creado:", formData);
          navigate(-1);
        })
        .catch((error) => {
          console.error("Error al enviar el formulario:", error);
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
    <MDBox mt={5} mb={9}>
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
  idObra: PropTypes.number,
};
export default Formulario;
