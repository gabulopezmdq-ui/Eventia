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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-flatpickr components
import Flatpickr from "react-flatpickr";

// react-flatpickr styles
import "flatpickr/dist/flatpickr.css";

// Material Dashboard 2 PRO React components
import MDInput from "components/MDInput";

function MDDatePicker({ input, ...rest }) {
  return (
    <Flatpickr
      className="inputDate"
      {...rest}
      options={{
        dateFormat: "Y/m/d", // Establece el formato de fecha deseado
      }}
      value={input.value} // Utiliza el valor del campo pasado como "input.value"
      onChange={(selectedDates) => {
        const selectedDate = selectedDates[0];
        if (input && typeof input.onChange === "function") {
          input.onChange(selectedDate); // Llama a la función onChange con la fecha seleccionada
        } else {
          console.error("El objeto 'input' no tiene una función 'onChange'");
        }
      }}
    />
  );
}

MDDatePicker.defaultProps = {
  input: {},
};

MDDatePicker.propTypes = {
  input: PropTypes.objectOf(PropTypes.any),
};

export default MDDatePicker;
