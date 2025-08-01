import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const ConfirmDialog = ({ open, onClose, onConfirm, message }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar eliminación</DialogTitle>
      <DialogContent>
        <MDTypography variant="subtitle2">{message}</MDTypography>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary" size="small">
          Cancelar
        </MDButton>
        <MDButton onClick={onConfirm} color="error" size="small">
          Eliminar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default ConfirmDialog;
