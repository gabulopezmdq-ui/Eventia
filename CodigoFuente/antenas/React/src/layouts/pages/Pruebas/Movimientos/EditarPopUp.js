import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import PropTypes from "prop-types";

// Formularios modulares
import FormTipoA from "./TiposForm/AltaForm";
import FormTipoM from "./TiposForm/ModificacionForm";
import FormTipoB from "./TiposForm/BajaForm";
import FormTipoD from "./TiposForm/AdicionalForm";

function EditarDetallePopup({ open, onClose, detalle, onSave }) {
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    if (detalle) setFormValues(detalle);
  }, [detalle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => onSave(formValues);

  if (!detalle) return null;
  const { tipoMovimiento } = detalle;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Detalle - Tipo {tipoMovimiento}</DialogTitle>

      <DialogContent>
        <MDBox display="flex" flexDirection="column" gap={2} mt={2}>
          {tipoMovimiento === "A" && (
            <FormTipoA formValues={formValues} handleChange={handleChange} />
          )}
          {tipoMovimiento === "M" && (
            <FormTipoM formValues={formValues} handleChange={handleChange} />
          )}
          {tipoMovimiento === "B" && (
            <FormTipoB formValues={formValues} handleChange={handleChange} />
          )}
          {tipoMovimiento === "D" && (
            <FormTipoD formValues={formValues} handleChange={handleChange} />
          )}
        </MDBox>
      </DialogContent>

      <DialogActions>
        <MDButton onClick={onClose} size="small" color="secondary">
          Cancelar
        </MDButton>
        <MDButton onClick={handleSave} size="small" color="success">
          Guardar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

EditarDetallePopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detalle: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default EditarDetallePopup;
