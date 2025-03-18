import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import MDButton from "components/MDButton";

const SupleAPopup = ({ open, handleClose, suplente, idEstablecimiento, onSubmit }) => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    if (open && idEstablecimiento) {
      setLoading(true);
      axios
        .get(
          `${process.env.REACT_APP_API_URL}Consolidar/Docentes?idestablecimiento=${idEstablecimiento}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          const formattedData = response.data.map((docente) => ({
            id: docente.idPersona,
            nombreCompleto: `${docente.nombre} ${docente.apellido}`,
          }));
          setDocentes(formattedData);
          if (suplente?.pof?.pofDetalle?.[0]) {
            const detalle = suplente.pof.pofDetalle[0];
            setSelectedDocente(detalle.suplencia?.persona?.idPersona || "");
            setFechaDesde(detalle.supleDesde?.split("T")[0] || "");
            setFechaHasta(detalle.supleHasta?.split("T")[0] || "");
          }
        })
        .catch((error) => console.error("Error obteniendo docentes:", error))
        .finally(() => setLoading(false));
    }
  }, [open, idEstablecimiento, suplente]);

  useEffect(() => {
    if (open) {
      setShowAlert(false);
      setAlertType("success");
      setAlertMessage("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedDocente("");
      setFechaDesde("");
      setFechaHasta("");
    }
  }, [open]);

  const handleEnviar = async () => {
    try {
      const data = {
        idPOF: suplente.idPOF,
        SupleA: selectedDocente,
        supleDesde: fechaDesde,
        supleHasta: fechaHasta,
        idCabecera: suplente.cabecera.idCabecera,
      };

      await onSubmit(data);

      setAlertType("success");
      setAlertMessage("Suplente asignado correctamente!");
      setShowAlert(true);

      setTimeout(() => {
        handleClose();
        setShowAlert(false);
      }, 2000);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(error.response?.data?.message || "Error al asignar suplente");
      setShowAlert(true);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Asignar Suplente</DialogTitle>
      <DialogContent>
        {showAlert && (
          <MDBox mt={1} mb={2}>
            <MDAlert color={alertType} dismissible onClose={() => setShowAlert(false)}>
              <MDTypography variant="body2" color="white">
                {alertMessage}
              </MDTypography>
            </MDAlert>
          </MDBox>
        )}
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              label="Nombre del Suplente"
              fullWidth
              margin="dense"
              value={
                suplente
                  ? `${suplente.pof?.persona?.nombre} ${suplente.pof?.persona?.apellido}`
                  : ""
              }
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Documento"
              fullWidth
              margin="dense"
              value={suplente ? suplente.pof?.persona?.dni : ""}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Suple A</InputLabel>
              <Select
                value={selectedDocente}
                onChange={(e) => setSelectedDocente(e.target.value)}
                disabled={loading}
                label="Suple A"
                style={{ height: "2.8rem", backgroundColor: "white" }}
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={24} />
                  </MenuItem>
                ) : (
                  docentes.map((docente) => (
                    <MenuItem key={docente.id} value={docente.id}>
                      {docente.nombreCompleto}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Fecha Desde"
              type="date"
              fullWidth
              margin="dense"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Fecha Hasta"
              type="date"
              fullWidth
              margin="dense"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={handleClose} size="small" color="secondary">
          Cancelar
        </MDButton>
        <MDButton
          onClick={handleEnviar}
          color="info"
          variant="gradient"
          size="small"
          disabled={!selectedDocente}
        >
          Enviar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

SupleAPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  suplente: PropTypes.shape({
    idPOF: PropTypes.number.isRequired,
    cabecera: PropTypes.shape({
      idCabecera: PropTypes.number.isRequired,
    }),
    pof: PropTypes.shape({
      idPersona: PropTypes.number.isRequired,
      persona: PropTypes.shape({
        nombre: PropTypes.string,
        apellido: PropTypes.string,
        dni: PropTypes.string,
      }),
      pofDetalle: PropTypes.arrayOf(
        PropTypes.shape({
          suplencia: PropTypes.shape({
            persona: PropTypes.shape({
              idPersona: PropTypes.number,
            }),
          }),
          supleDesde: PropTypes.string,
          supleHasta: PropTypes.string,
        })
      ),
    }),
  }),
  idEstablecimiento: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SupleAPopup;
