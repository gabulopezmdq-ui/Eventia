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
import Grid from "@mui/material/Grid";
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
    antiguedadAnioRef: "",
    antiguedadMesRef: "",
    cantAniosAntiguedad: "",
    cantMesesAntiguedad: "",
  });
  useEffect(() => {
    if (docente) {
      setFormData({
        docenteNombre: `${docente.personaNombre} ${docente.personaApellido}`,
        documento: docente.personaDNI || "",
        cargo: docente.tipoCargo || "",
        anioReferencia: docente.mecanizadaAnioAfeccion || "",
        mesReferencia: docente.mecanizadaMesAfeccion || "",
        cantHorasConSub: docente.cantHorasCS ?? "",
        cantHorasSinSub: docente.cantHorasSS ?? "",
        sinHaberes: docente.sinHaberes ? "S" : "N",
        noSubvencionado: docente.noSubvencionado ?? docente.noSubvencionadas ? "S" : "N",
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
    setFormData({ ...formData, [name]: checked ? "S" : "N" });
  };
  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar a MEC</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              label="Nombre del Docente"
              margin="dense"
              value={formData.docenteNombre}
              disabled
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Documento"
              margin="dense"
              value={formData.documento}
              disabled
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Cargo" fullWidth margin="dense" value={formData.cargo} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Año Referencia"
              name="anioReferencia"
              fullWidth
              margin="dense"
              value={formData.anioReferencia}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Mes Referencia</InputLabel>
              <Select
                name="mesReferencia"
                value={formData.mesReferencia}
                onChange={handleChange}
                style={{ height: "2.8rem", backgroundColor: "white" }}
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
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cant. Horas con Subvención"
              name="cantHorasConSub"
              fullWidth
              margin="dense"
              type="number"
              value={formData.cantHorasConSub}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cant. Horas sin Subvención"
              name="cantHorasSinSub"
              fullWidth
              margin="dense"
              type="number"
              value={formData.cantHorasSinSub}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
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
          </Grid>
          <Grid item xs={6}>
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
          </Grid>
          {!tieneAntiguedad && (
            <>
              <Grid item xs={6}>
                <TextField
                  label="Año Referencia Antigüedad"
                  name="antiguedadAnioRef"
                  fullWidth
                  margin="dense"
                  value={formData.antiguedadAnioRef}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Mes Ref. Antigüedad</InputLabel>
                  <Select
                    name="antiguedadMesRef"
                    value={formData.antiguedadMesRef}
                    onChange={handleChange}
                    style={{ height: "2.8rem", backgroundColor: "white" }}
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
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Cant. Años Antigüedad"
                  name="cantAniosAntiguedad"
                  fullWidth
                  margin="dense"
                  type="number"
                  value={formData.cantAniosAntiguedad}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Cant. Meses Antigüedad"
                  name="cantMesesAntiguedad"
                  fullWidth
                  margin="dense"
                  type="number"
                  value={formData.cantMesesAntiguedad}
                  onChange={handleChange}
                />
              </Grid>
            </>
          )}
        </Grid>
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
    personaDNI: PropTypes.string,
    tipoCargo: PropTypes.string,
    mecanizadaAnioAfeccion: PropTypes.string,
    mecanizadaMesAfeccion: PropTypes.string,
    cantHorasCS: PropTypes.number,
    cantHorasSS: PropTypes.number,
    noSubvencionado: PropTypes.bool,
  }),
  tieneAntiguedad: PropTypes.bool.isRequired,
};
export default MecPopup;
