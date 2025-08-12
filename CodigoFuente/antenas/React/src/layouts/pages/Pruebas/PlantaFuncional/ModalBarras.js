import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Modal, TextField, Chip, Stack } from "@mui/material";
import MDButton from "components/MDButton";
import ConfirmDialog from "./ConfirmDialog";
import MDTypography from "components/MDTypography";
import axios from "axios";

const ModalBarras = ({ isOpenBarras, onCloseBarras, idPof, onEditSuccess }) => {
  const token = sessionStorage.getItem("token");
  const [currentBarra, setCurrentBarra] = useState("");
  const [barrasList, setBarrasList] = useState([]);
  const [barrasIniciales, setBarrasIniciales] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [barraAEliminar, setBarraAEliminar] = useState(null);

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

  useEffect(() => {
    const fetchBarrasAsociadas = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}POF/GetPOFBarras?idPOF=${idPof}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const barrasExistentes = response.data.map((item) => ({
          idPOFBarra: item.idPOFBarra,
          idPOF: item.idPOF,
          barra: item.barra?.toString(),
        }));
        console.log("barrasExistentes: ", barrasExistentes);
        setBarrasList(barrasExistentes || []);
        setBarrasIniciales(barrasExistentes || []);
      } catch (error) {
        console.error("Error al obtener las barras asociadas:", error);
      }
    };

    if (isOpenBarras && idPof) {
      fetchBarrasAsociadas();
    }
  }, [isOpenBarras, idPof]);

  const handleAgregarBarra = () => {
    const nuevaBarra = currentBarra.trim();
    if (nuevaBarra !== "" && !barrasList.some((b) => b.barra === nuevaBarra)) {
      setBarrasList([...barrasList, { idPOFBarra: null, idPOF: idPof, barra: nuevaBarra }]);
      setCurrentBarra("");
    }
  };

  const handleEliminarBarra = (index) => {
    const barra = barrasList[index];
    const esDelBackend = barra.idPOFBarra !== null; // Si tiene idPOFBarra es del backend

    if (esDelBackend) {
      setBarraAEliminar(barra);
      setConfirmOpen(true);
    } else {
      const newList = [...barrasList];
      newList.splice(index, 1);
      setBarrasList(newList);
    }
  };
  const confirmarEliminacion = async () => {
    if (!barraAEliminar) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}POF/DeleteBarra`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          idPof,
          idPOFBarra: barraAEliminar.idPOFBarra,
        },
      });

      setBarrasList((prev) => prev.filter((b) => b.idPOFBarra !== barraAEliminar.idPOFBarra));
      setBarrasIniciales((prev) => prev.filter((b) => b.idPOFBarra !== barraAEliminar.idPOFBarra));
    } catch (error) {
      console.error("Error al eliminar la barra del backend:", error);
    } finally {
      setConfirmOpen(false);
      setBarraAEliminar(null);
    }
  };

  const handleGuardar = async () => {
    if (barrasList.length === 0) {
      console.warn("No hay barras para guardar");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}POF/Barras`,
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
    setBarrasIniciales([]);
    setCurrentBarra("");
    onCloseBarras();
  };

  return (
    <>
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
                    key={barra.idPOFBarra || `new-${index}`}
                    label={barra.barra}
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
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmarEliminacion}
        message={`¿Estás seguro que querés eliminar la barra "${barraAEliminar?.barra}" de forma permanente?`}
      />
    </>
  );
};

ModalBarras.propTypes = {
  isOpenBarras: PropTypes.bool.isRequired,
  onCloseBarras: PropTypes.func.isRequired,
  idPof: PropTypes.number,
  onEditSuccess: PropTypes.func.isRequired,
};

export default ModalBarras;
