import React from "react";
import PropTypes from "prop-types";
import { Box, Modal } from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const ModalBarras = ({ isOpenBarras, onCloseBarras, idPof, onEditSuccess }) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "0.5rem",
  };

  const handleGuardar = () => {
    // Simula acción exitosa
    if (onEditSuccess) {
      onEditSuccess();
    }
    onCloseBarras(); // Cierra el modal
  };

  return (
    <Modal open={isOpenBarras} onClose={onCloseBarras} aria-labelledby="modal-title">
      <Box sx={style}>
        <MDTypography id="modal-title" variant="h6" gutterBottom>
          Modal Barras
        </MDTypography>

        <MDTypography variant="body2" mb={2}>
          ID de la POF seleccionado: <strong>{idPof}</strong>
        </MDTypography>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <MDButton
            variant="contained"
            size="small"
            color="error"
            onClick={onCloseBarras}
            style={{ marginRight: "10px" }}
          >
            Cancelar
          </MDButton>
          <MDButton variant="contained" size="small" color="info" onClick={handleGuardar}>
            Guardar
          </MDButton>
        </Box>
      </Box>
    </Modal>
  );
};

ModalBarras.propTypes = {
  isOpenBarras: PropTypes.bool.isRequired,
  onCloseBarras: PropTypes.func.isRequired,
  idPof: PropTypes.number,
  onEditSuccess: PropTypes.func.isRequired,
};

export default ModalBarras;
