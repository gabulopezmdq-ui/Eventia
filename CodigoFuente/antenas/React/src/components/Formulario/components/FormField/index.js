import React from "react";
import PropTypes from "prop-types";
import MDInput from "components/MDInput";

function FormField({
  label,
  name,
  type,
  formData,
  handleChange,
  readOnly = false,
  disabled = false,
}) {
  return (
    <MDInput
      type={type}
      label={label}
      name={name}
      value={formData[name] || ""}
      onChange={handleChange}
      variant="standard"
      fullWidth
      InputProps={{
        readOnly: readOnly,
      }}
      disabled={disabled}
    />
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default FormField;
