import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
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
}) {
  const [options, setOptions] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (apiUrl && apiUrl.includes("${idConservadora}")) {
      const idConservadora = formData["idConservadora"];
      const url = apiUrl.replace("${idConservadora}", idConservadora);
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setOptions(response.data);
        })
        .catch((error) => {
          console.error("Error al cargar las opciones:", error);
        });
    } else if (apiUrl) {
      axios
        .get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const filteredOptions = response.data.filter((option) => {
            if ("vigente" in option) {
              return option.vigente === "S";
            }
            return true;
          });
          setOptions(filteredOptions);
        })
        .catch((error) => {
          console.error("Error al cargar las opciones:", error);
        });
    }
  }, [apiUrl, formData.idConservadora, token]);

  const combinedOptions = [...customOptions, ...options];

  return (
    <div>
      <Autocomplete
        options={combinedOptions}
        getOptionLabel={(option) =>
          optionField === "nombre" && option.apellido
            ? `${option.nombre} ${option.apellido}`
            : option[optionField]
        }
        value={combinedOptions.find((option) => option[valueField] === formData[name]) || null}
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
  apiUrl: PropTypes.string,
  valueField: PropTypes.string.isRequired,
  optionField: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  customOptions: PropTypes.array,
};

SelectField.defaultProps = {
  apiUrl: null,
  customOptions: [],
};

export default SelectField;
