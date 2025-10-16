import React from "react";
import PropTypes from "prop-types";
import { Grid, TextField } from "@mui/material";

function FormTipoA({ formValues, handleChange }) {
  return (
    <Grid container spacing={2}>
      {/* === SOLO LECTURA === */}
      <Grid item xs={4}>
        <TextField
          label="Tipo Documento"
          name="tipoDoc"
          value={formValues.tipoDoc || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Situación de Revista"
          name="sitRevista"
          value={formValues.sitRevista || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Función"
          name="idTipoFuncion"
          value={formValues.idTipoFuncion || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Ruralidad"
          name="rural"
          value={formValues.rural || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Turno"
          name="turno"
          value={formValues.turno || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Categoría"
          name="idTipoCategoria"
          value={formValues.idTipoCategoria || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Observaciones Detalle"
          name="observacionDetalle"
          value={formValues.observacionDetalle || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
          multiline
          rows={2}
        />
      </Grid>

      {/* === EDITABLES === */}
      <Grid item xs={4}>
        <TextField
          label="N° Documento"
          name="numDoc"
          value={formValues.numDoc || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Apellido"
          name="apellido"
          value={formValues.apellido || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Nombre"
          name="nombre"
          value={formValues.nombre || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Horas"
          name="horas"
          value={formValues.horas || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Antigüedad (Años)"
          name="antigAnios"
          value={formValues.antigAnios || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={4}>
        <TextField
          label="Antigüedad (Meses)"
          name="antigMeses"
          value={formValues.antigMeses || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Observaciones"
          name="observaciones"
          value={formValues.observaciones || ""}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
        />
      </Grid>
    </Grid>
  );
}

FormTipoA.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default FormTipoA;
