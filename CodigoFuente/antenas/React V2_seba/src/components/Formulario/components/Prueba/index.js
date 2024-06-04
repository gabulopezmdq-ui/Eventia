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
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";

function Prueba({ formData, handleChange, fields }) {
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
                        checked={formData[field.name] || false}
                        onChange={handleChange}
                        name={field.name}
                      />
                    }
                    label={field.label}
                  />
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
