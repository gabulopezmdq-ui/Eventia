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

// prop-type is a library for typechecking of props
import React from "react";
import PropTypes from "prop-types";
import MDInput from "components/MDInput";

function FormField({ label, name, type, formData, handleChange }) {
  return (
    <MDInput
      type={type}
      label={label}
      name={name}
      value={formData[name] || ""} // Valor predeterminado si es undefined
      onChange={handleChange}
      variant="standard"
      fullWidth
    />
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};
export default FormField;
