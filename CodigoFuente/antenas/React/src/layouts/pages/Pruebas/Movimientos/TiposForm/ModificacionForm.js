import React from "react";
import { Grid, TextField } from "@mui/material";

const ModificacionForm = ({ formValues, handleChange }) => {
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
      <Grid item xs={4}>
        <TextField
          label="Decrece"
          name="decrece"
          value={formValues.decrece || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Antigüedad (Años)"
          name="antigAnios"
          value={formValues.antigAnios || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Antigüedad (Meses)"
          name="antigMeses"
          value={formValues.antigMeses || ""}
          fullWidth
          InputProps={{ readOnly: true }}
          disabled
        />
      </Grid>

      {/* EDITABLES */}
      <Grid item xs={4}>
        <TextField
          label="Horas"
          name="horas"
          value={formValues.horas || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={8}>
        <TextField
          label="Observaciones Detalle"
          name="observacionDetalle"
          value={formValues.observacionDetalle || ""}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Horas Decrece"
          name="horasDecrece"
          value={formValues.horasDecrece || ""}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};
ModificacionForm.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default ModificacionForm;
