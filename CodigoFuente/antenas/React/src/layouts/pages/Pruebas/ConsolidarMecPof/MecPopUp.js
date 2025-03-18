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
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import MDButton from "components/MDButton";

const MecPopup = ({ open, handleClose, docente, onSubmit, tieneAntiguedad, idCabecera }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
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
    idCabecera: "",
    idEstablecimiento: "",
  });
  useEffect(() => {
    if (docente) {
      setFormData({
        docenteNombre: `${docente.personaNombre || ""} ${docente.personaApellido || ""}`,
        documento: docente.personaDNI || "",
        cargo: docente.tipoCargo || "",
        anioReferencia: docente.mecanizadaAnioAfeccion ?? "",
        mesReferencia: docente.mecanizadaMesAfeccion ?? "",
        cantHorasConSub: docente.cantHorasCS ?? 0,
        cantHorasSinSub: docente.cantHorasSS ?? 0,
        sinHaberes: docente.sinHaberes ? "S" : "N",
        noSubvencionado: docente.noSubvencionado ?? docente.noSubvencionadas ? "S" : "N",
        antiguedadAnioRef: docente.anioAntiguedad ?? "",
        antiguedadMesRef: docente.mesAntiguedad ?? "",
        cantAniosAntiguedad: docente.anioAntiguedad ?? "",
        cantMesesAntiguedad: docente.mesAntiguedad ?? "",
        idPOF: docente.idPOF ?? "",
        idCabecera: idCabecera ?? "",
        idEstablecimiento: docente.idEstablecimiento ?? "",
      });
    }
  }, [docente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const camposNumericos = [
      "mesReferencia",
      "antiguedadMesRef",
      "cantAniosAntiguedad",
      "cantMesesAntiguedad",
    ];
    setFormData({
      ...formData,
      [name]: camposNumericos.includes(name) ? Number(value) || value : value,
    });
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked ? "S" : "N" });
  };
  const handleSubmit = async () => {
    try {
      const submitData = tieneAntiguedad
        ? {
            idCabecera: formData.idCabecera,
            idPOF: formData.idPOF,
            cantHorasCs: formData.cantHorasConSub,
            cantHorasSs: formData.cantHorasSinSub,
            anioReferencia: formData.anioReferencia,
            mesReferencia: formData.mesReferencia,
            sinHaberes: formData.sinHaberes,
            noSubvencionado: formData.noSubvencionado,
            idEstablecimiento: formData.idEstablecimiento,
          }
        : {
            idCabecera: formData.idCabecera,
            idPOF: formData.idPOF,
            cantHorasCs: formData.cantHorasConSub,
            cantHorasSs: formData.cantHorasSinSub,
            anioReferencia: formData.anioReferencia,
            mesReferencia: formData.mesReferencia,
            sinHaberes: formData.sinHaberes,
            noSubvencionado: formData.noSubvencionado,
            mesRefAntiguedad: formData.antiguedadMesRef,
            anioRefAntiguedad: formData.antiguedadAnioRef,
            cantAnioAntiguedad: formData.cantAniosAntiguedad,
            cantMesAntiguedad: formData.cantMesesAntiguedad,
            idEstablecimiento: formData.idEstablecimiento,
            anioAfeccion: formData.anioReferencia,
            mesAfeccion: formData.mesReferencia,
          };
      await onSubmit(submitData);
      setAlertType("success");
      setAlertMessage("Operación realizada con éxito!");
      setShowAlert(true);
      setTimeout(() => {
        handleClose();
        setShowAlert(false);
      }, 3500);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(error.response?.data?.message || "Error en la operación");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 4500);
    }
  };

  useEffect(() => {
    if (open) {
      setShowAlert(false);
      setAlertType("success");
      setAlertMessage("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar a MEC</DialogTitle>
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
                label="Mes Referencia"
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
                  <MenuItem key={index} value={index + 1}>
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
                    label="Mes Ref. Antigüedad"
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
                      <MenuItem key={index} value={index + 1}>
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
  idCabecera: PropTypes.number,
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
    anioAntiguedad: PropTypes.number,
    idPOF: PropTypes.number,
    mesAntiguedad: PropTypes.number,
    idEstablecimiento: PropTypes.number,
  }),
  tieneAntiguedad: PropTypes.bool.isRequired,
};
export default MecPopup;
