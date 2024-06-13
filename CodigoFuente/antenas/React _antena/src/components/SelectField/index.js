import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormField from "layouts/pages/account/components/FormField";

function SelectField({ label, name, apiUrl, valueField, optionField, formData, handleChange }) {
  const [options, setOptions] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // Lógica de carga inicial de opciones desde la API
    if (apiUrl.includes("${idConservadora}")) {
      const idConservadora = formData["idConservadora"];
      const url = apiUrl.replace("${idConservadora}", idConservadora);
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`, // Envía el token en los headers
          },
        })
        .then((response) => {
          setOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar las opciones:", error);
        });
    } else {
      axios
        .get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`, // Envía el token en los headers
          },
        })
        .then((response) => {
          setOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar las opciones:", error);
        });
    }
  }, [formData.idConservadora]);

  return (
    <div>
      <Autocomplete
        options={options}
        getOptionLabel={(option) =>
          optionField === "nombre" && option.apellido
            ? `${option.nombre} ${option.apellido}`
            : option[optionField]
        }
        value={options.find((option) => option[valueField] === formData[name]) || null}
        onChange={(event, newValue) => {
          handleChange({ target: { name, value: newValue ? newValue[valueField] : null } });
        }}
        renderInput={(params) => <FormField {...params} label={label} />}
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
