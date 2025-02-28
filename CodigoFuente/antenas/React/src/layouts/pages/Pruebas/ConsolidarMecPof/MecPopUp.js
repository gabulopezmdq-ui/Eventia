import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MDButton from "components/MDButton";

const MecPopup = ({ open, handleClose, docente, onSubmit, tieneAntiguedad }) => {
  const [formData, setFormData] = useState({
    docenteNombre: "",
    documento: "",
    cargo: "",
    anioReferencia: "",
    mesReferencia: "",
    cantHorasConSub: "",
    cantHorasSinSub: "",
    sinHaberes: false,
    noSubvencionado: false,
    // Sección de antigüedad (solo si no hay registro)
    antiguedadAnioRef: "",
    antiguedadMesRef: "",
    cantAniosAntiguedad: "",
    cantMesesAntiguedad: "",
  });
  // Actualiza formData cuando cambie docente
  useEffect(() => {
    if (docente) {
      setFormData({
        docenteNombre: `${docente.personaNombre} ${docente.personaApellido}`,
        documento: docente.documento || "",
        cargo: docente.cargo || "",
        anioReferencia: "",
        mesReferencia: "",
        cantHorasConSub: "",
        cantHorasSinSub: "",
        sinHaberes: docente.sinHaberes || false,
        noSubvencionado: docente.noSubvencionadas || false,
        antiguedadAnioRef: "",
        antiguedadMesRef: "",
        cantAniosAntiguedad: "",
        cantMesesAntiguedad: "",
      });
    }
  }, [docente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    // Convertir booleano a "S" o "N"
    setFormData({ ...formData, [name]: checked ? "S" : "N" });
  };
  const handleSubmit = () => {
    onSubmit(formData); // Enviar datos al backend
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar a MEC</DialogTitle>
      <DialogContent>
        {/* Datos del docente */}
        <TextField
          label="Nombre del Docente"
          fullWidth
          margin="dense"
          value={formData.docenteNombre}
          disabled
        />
        <TextField label="Documento" fullWidth margin="dense" value={formData.documento} disabled />
        <TextField label="Cargo" fullWidth margin="dense" value={formData.cargo} disabled />

        {/* Campos editables */}
        <TextField
          label="Año Referencia"
          name="anioReferencia"
          fullWidth
          margin="dense"
          value={formData.anioReferencia}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Mes Referencia</InputLabel>
          <Select
            value={formData.mesReferencia}
            onChange={handleChange}
            label="Mes Referencia"
            style={{ height: "2.8rem", backgroundColor: "white" }}
            name="mesReferencia"
          >
            {[
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ].map((mes, index) => (
              <MenuItem key={index} value={mes}>
                {mes}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Cant. Horas con Subvención"
          name="cantHorasConSub"
          fullWidth
          margin="dense"
          type="number"
          value={formData.cantHorasConSub}
          onChange={handleChange}
        />
        <TextField
          label="Cant. Horas sin Subvención"
          name="cantHorasSinSub"
          fullWidth
          margin="dense"
          type="number"
          value={formData.cantHorasSinSub}
          onChange={handleChange}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="sinHaberes"
              checked={formData.sinHaberes === "S"}
              onChange={handleCheckboxChange}
            />
          }
          label="Sin Haberes"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="noSubvencionado"
              checked={formData.noSubvencionado === "S"}
              onChange={handleCheckboxChange}
            />
          }
          label="No Subvencionado"
        />

        {/* Sección de antigüedad (solo si no tiene registro) */}
        {!tieneAntiguedad && (
          <>
            <TextField
              label="Año Referencia (Antigüedad)"
              name="antiguedadAnioRef"
              fullWidth
              margin="dense"
              value={formData.antiguedadAnioRef}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Mes Ref. Antiguedad</InputLabel>
              <Select
                value={formData.antiguedadMesRef}
                onChange={handleChange}
                label="Mes Referencia"
                style={{ height: "2.8rem", background: "white" }}
                name="antiguedadMesRef"
              >
                {[
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembre",
                  "Diciembre",
                ].map((mes, index) => (
                  <MenuItem key={index} value={mes}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Cant. Años Antigüedad"
              name="cantAniosAntiguedad"
              fullWidth
              margin="dense"
              type="number"
              value={formData.cantAniosAntiguedad}
              onChange={handleChange}
            />
            <TextField
              label="Cant. Meses Antigüedad"
              name="cantMesesAntiguedad"
              fullWidth
              margin="dense"
              type="number"
              value={formData.cantMesesAntiguedad}
              onChange={handleChange}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <MDButton onClick={handleClose} size="small" color="secondary">
          Cancelar
        </MDButton>
        <MDButton onClick={handleSubmit} size="small" color="info" variant="gradient">
          Enviar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

MecPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  docente: PropTypes.shape({
    personaNombre: PropTypes.string,
    personaApellido: PropTypes.string,
    documento: PropTypes.string,
    cargo: PropTypes.string,
    sinHaberes: PropTypes.bool,
    noSubvencionadas: PropTypes.bool,
  }),
  tieneAntiguedad: PropTypes.bool.isRequired,
};
export default MecPopup;
