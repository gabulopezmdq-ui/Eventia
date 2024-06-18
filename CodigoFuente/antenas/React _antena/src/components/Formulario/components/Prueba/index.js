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
import React from "react";
import PropTypes from "prop-types";
import FormField from "../FormField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import MDBox from "components/MDBox";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import SelectField from "components/SelectField";
import MDDatePicker from "components/MDDatePicker";
import MDTypography from "components/MDTypography";
function Prueba({ formData, handleChange, fields }) {
  const initialFormData = { ...formData };
  fields.forEach((field) => {
    if (field.type === "checkbox") {
      if (typeof initialFormData[field.name] === "undefined") {
        initialFormData[field.name] = false;
      }
    }
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    handleChange({ target: { name, value: checked } });
  };

  return (
    <MDBox>
      <MDBox mt={3}>
        <form>
          <Grid container spacing={3}>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                {field.type === "checkbox" ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={initialFormData[field.name]}
                        onChange={handleCheckboxChange}
                        name={field.name}
                      />
                    }
                    label={field.label}
                  />
                ) : field.type === "select" ? (
                  <SelectField
                    label={field.label}
                    name={field.name}
                    apiUrl={field.apiUrl}
                    valueField={field.valueField} // Nombre del campo del valor
                    optionField={field.optionField} // Nombre del campo de la opción
                    formData={formData}
                    handleChange={handleChange}
                  />
                ) : field.type === "date" ? (
                  <div className="flex">
                    <MDTypography variant="button" className="texto">
                      {field.label}
                    </MDTypography>
                    <MDDatePicker
                      input={{
                        value: formData[field.name],
                        onChange: (selectedDate) => {
                          handleChange({ target: { name: field.name, value: selectedDate } });
                        },
                      }}
                    />
                  </div>
                ) : (
                  <FormField
                    type={field.type}
                    label={field.label}
                    name={field.name}
                    formData={formData}
                    handleChange={handleChange}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </form>
      </MDBox>
    </MDBox>
  );
}
Prueba.propTypes = {
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};
export default Prueba;
