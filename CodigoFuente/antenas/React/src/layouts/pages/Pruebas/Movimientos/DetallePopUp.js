import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import MDButton from "components/MDButton";

export default function DetallePopup({ open, onClose, detalle }) {
  if (!detalle) return null;
  const fullRowFields = ["observaciones", "observacionDetalle"];

  // Función para formatear etiquetas (ej: antigAnios -> Antig Años)
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // separa camelCase
      .replace(/^./, (str) => str.toUpperCase()); // primera mayúscula
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle del Movimiento</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {Object.entries(detalle).map(([key, value]) => (
            <Grid item xs={fullRowFields.includes(key) ? 12 : 6} key={key}>
              <Typography>
                <b>{formatLabel(key)}:</b>{" "}
                {value !== null && value !== undefined && value !== "" ? value : "-"}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="info" variant="gradient" size="small">
          Cerrar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DetallePopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detalle: PropTypes.object,
};
