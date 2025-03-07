import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
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
  const token = sessionStorage.getItem("token");
  console.log("ID Establecimiento : ", idEstablecimiento);
  useEffect(() => {
    if (open && idEstablecimiento) {
      setLoading(true);
      axios
        .get(
          `${process.env.REACT_APP_API_URL}Consolidar/Docentes?idestablecimiento=${idEstablecimiento}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          // Mapear los datos antes de guardarlos
          const formattedData = response.data.map((docente) => ({
            id: docente.idPersona, // Usamos idPersona como identificador
            nombreCompleto: `${docente.nombre} ${docente.apellido}`, // Concatenamos nombre + apellido
          }));
          setDocentes(formattedData);
        })
        .catch((error) => {
          console.error("Error obteniendo docentes:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, idEstablecimiento]);
  const handleEnviar = () => {
    const data = {
      suplenteId: suplente.id,
      docenteId: selectedDocente,
      desde: fechaDesde,
      hasta: fechaHasta,
    };
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Asignar Suplente</DialogTitle>
      <DialogContent>
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
    id: PropTypes.number,
    pof: PropTypes.shape({
      persona: PropTypes.shape({
        nombre: PropTypes.string,
        apellido: PropTypes.string,
        dni: PropTypes.string,
      }),
    }),
  }),
  idEstablecimiento: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SupleAPopup;
