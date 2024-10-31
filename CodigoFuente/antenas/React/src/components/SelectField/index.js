import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Autocomplete from "@mui/material/Autocomplete";
import FormField from "layouts/pages/account/components/FormField";

function SelectField({
  label,
  name,
  apiUrl,
  valueField,
  optionField,
  formData,
  handleChange,
  customOptions,
  multiple = false,
}) {
  const [options, setOptions] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (apiUrl) {
      axios
        .get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar las opciones desde la API:", error);
        });
    }
  }, [apiUrl, token]);

  // Usa customOptions si se proporcionan, de lo contrario usa las opciones obtenidas de la API
  const combinedOptions = customOptions.length > 0 ? customOptions : options;

  const handleSelectionChange = (event, newValue) => {
    const selectedValues = multiple
      ? newValue.map((option) => option[valueField])
      : newValue
      ? [newValue[valueField]]
      : [];
    handleChange({
      target: {
        name,
        value: multiple ? selectedValues : selectedValues[0] || null,
      },
    });
  };

  return (
    <div>
      <Autocomplete
        multiple={multiple}
        options={combinedOptions}
        getOptionLabel={(option) =>
          optionField === "nombre" && option.apellido
            ? `${option.nombre} ${option.apellido}`
            : option[optionField]
        }
        value={
          multiple
            ? combinedOptions.filter((option) => formData[name]?.includes(option[valueField]))
            : combinedOptions.find((option) => option[valueField] === formData[name]) || null
        }
        onChange={handleSelectionChange}
        renderInput={(params) => <FormField {...params} label={label} />}
      />
    </div>
  );
}

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  apiUrl: PropTypes.string,
  valueField: PropTypes.string.isRequired,
  optionField: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  customOptions: PropTypes.array,
  multiple: PropTypes.bool,
};

SelectField.defaultProps = {
  apiUrl: null,
  customOptions: [],
  multiple: false,
};

export default SelectField;
