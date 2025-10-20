import React from "react";
import PropTypes from "prop-types";
import { Grid, TextField } from "@mui/material";

const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

const BajaForm = ({ formValues, handleChange }) => {
  console.log(formValues);
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Apellido"
          name="apellido"
          value={formValues.apellido || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Nombre"
          name="nombre"
          value={formValues.nombre || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Observaciones"
          name="observaciones"
          value={formValues.observaciones || ""}
          fullWidth
          onChange={handleChange}
          multiline
          rows={2}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Motivo de Baja"
          name="idMotivoBaja"
          value={formValues.idMotivoBaja || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Fecha Inicio de Baja"
          name="fechaInicioBaja"
          type="date"
          value={formatDate(formValues.fechaInicioBaja) || ""}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Fecha Fin de Baja"
          name="fechaFinBaja"
          type="date"
          value={formatDate(formValues.fechaFinBaja) || ""}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </Grid>
  );
};
BajaForm.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};
export default BajaForm;
