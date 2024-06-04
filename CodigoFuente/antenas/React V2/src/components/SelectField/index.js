import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function SelectField({ label, name, apiUrl, valueField, optionField, formData, handleChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        setOptions(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar las opciones:", error);
      });
  }, [apiUrl]);

  return (
    <div>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option[optionField]}
        value={options.find((option) => option[valueField] === formData[name]) || null}
        onChange={(event, newValue) => {
          handleChange({ target: { name, value: newValue ? newValue[valueField] : "" } });
        }}
        renderInput={(params) => <TextField {...params} label={label} />}
      />
    </div>
  );
}

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  apiUrl: PropTypes.string.isRequired,
  valueField: PropTypes.string.isRequired,
  optionField: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default SelectField;
