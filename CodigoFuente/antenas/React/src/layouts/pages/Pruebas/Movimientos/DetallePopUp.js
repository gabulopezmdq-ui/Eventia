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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalle del Movimiento</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography>
              <b>ID Cabecera:</b> {detalle.idMovimientoCabecera}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <b>ID Detalle:</b> {detalle.idMovimientoDetalle}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>
              <b>Apellido:</b> {detalle.apellido}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <b>Nombre:</b> {detalle.nombre}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>
              <b>Tipo Doc:</b> {detalle.tipoDoc}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <b>N° Documento:</b> {detalle.numDoc}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>
              <b>Situación de Revista:</b> {detalle.sitRevista}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <b>Turno:</b> {detalle.turno}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>
              <b>Función:</b> {detalle.idTipoFuncion}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <b>Categoría:</b> {detalle.idTipoCategoria}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>
              <b>Horas:</b> {detalle.horas ?? "-"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <b>Antigüedad:</b>
              {detalle.antigAnios ? `${detalle.antigAnios} años` : ""}
              {detalle.antigMeses ? ` ${detalle.antigMeses} meses` : ""}
              {!detalle.antigAnios && !detalle.antigMeses && "-"}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography>
              <b>Observaciones:</b>
            </Typography>
            <Typography variant="body2">{detalle.observaciones ?? "-"}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography>
              <b>Observación Detalle:</b> {detalle.observacionDetalle ?? "-"}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography>
              <b>Fecha Inicio Baja:</b> {detalle.fechaInicioBaja ?? "-"}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <b>Fecha Fin Baja:</b> {detalle.fechaFinBaja ?? "-"}
            </Typography>
          </Grid>
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
