import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import MDButton from "components/MDButton";

export default function ModalAgregarPOF({ open, onClose, persona, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (persona) setFormData(persona);
  }, [persona]);

  if (!persona) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData); // lo mandamos al padre
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Agregar POF</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          {/* Campos no editables */}
          <Grid item xs={6}>
            <TextField label="Legajo" fullWidth value={formData.legajo} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Documento" fullWidth value={formData.documento} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Apellido" fullWidth value={formData.apellido} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Nombre" fullWidth value={formData.nombre} disabled />
          </Grid>

          {/* Campos editables */}
          <Grid item xs={6}>
            <TextField
              label="Secuencia"
              name="secuencia"
              fullWidth
              value={formData.secuencia || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Tipo Cargo"
              name="tipoCargo"
              fullWidth
              value={formData.tipoCargo || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="UE"
              name="ue"
              fullWidth
              value={formData.ue || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Barra"
              name="barra"
              fullWidth
              value={formData.barra || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Estado"
              name="estado"
              fullWidth
              value={formData.estado || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Cargo"
              name="cargo"
              fullWidth
              value={formData.cargo || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Caracter"
              name="caracter"
              fullWidth
              value={formData.caracter || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Función"
              name="funcion"
              fullWidth
              value={formData.funcion || ""}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <MDButton color="secondary" size="small" variant="contained" onClick={onClose}>
          Cancelar
        </MDButton>
        <MDButton color="success" size="small" variant="contained" onClick={handleSubmit}>
          Guardar POF
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

ModalAgregarPOF.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  persona: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};
