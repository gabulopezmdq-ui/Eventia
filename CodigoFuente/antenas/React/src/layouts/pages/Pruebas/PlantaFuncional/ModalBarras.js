import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Modal, TextField, Chip, Stack } from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import axios from "axios";

const ModalBarras = ({ isOpenBarras, onCloseBarras, idPof, onEditSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [currentBarra, setCurrentBarra] = useState("");
  const [barrasList, setBarrasList] = useState([]);

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

  const handleAgregarBarra = () => {
    if (currentBarra.trim() !== "") {
      setBarrasList([...barrasList, currentBarra.trim()]);
      setCurrentBarra("");
    }
  };

  const handleEliminarBarra = (index) => {
    const newList = [...barrasList];
    newList.splice(index, 1);
    setBarrasList(newList);
  };

  const handleGuardar = async () => {
    if (barrasList.length === 0) {
      console.warn("No hay barras para guardar");
      return;
    }

    try {
      const response = await axios.post(
        "POF/Barras",
        {
          idPof,
          barra: barrasList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta del backend:", response.data);
      if (onEditSuccess) onEditSuccess();
      onCloseBarras();
      setBarrasList([]);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleClose = () => {
    setBarrasList([]);
    setCurrentBarra("");
    onCloseBarras();
  };

  return (
    <Modal open={isOpenBarras} onClose={handleClose} aria-labelledby="modal-title">
      <Box sx={style}>
        <MDTypography id="modal-title" variant="h6" gutterBottom>
          Agregar Barras
        </MDTypography>

        <MDTypography variant="body2" mb={2}>
          ID de la POF seleccionado: <strong>{idPof}</strong>
        </MDTypography>

        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <TextField
            fullWidth
            label="Ingrese Barra"
            variant="outlined"
            value={currentBarra}
            onChange={(e) => setCurrentBarra(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAgregarBarra();
            }}
          />
          <MDButton variant="contained" size="small" color="success" onClick={handleAgregarBarra}>
            Agregar
          </MDButton>
        </Box>

        {barrasList.length > 0 && (
          <Box mt={2}>
            <MDTypography variant="caption" color="textSecondary">
              Barras agregadas:
            </MDTypography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
              {barrasList.map((barra, index) => (
                <Chip
                  key={index}
                  label={barra}
                  onDelete={() => handleEliminarBarra(index)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <MDButton
            variant="contained"
            size="small"
            color="error"
            onClick={handleClose}
            style={{ marginRight: "10px" }}
          >
            Cancelar
          </MDButton>
          <MDButton
            variant="contained"
            size="small"
            color="info"
            onClick={handleGuardar}
            disabled={barrasList.length === 0}
          >
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
