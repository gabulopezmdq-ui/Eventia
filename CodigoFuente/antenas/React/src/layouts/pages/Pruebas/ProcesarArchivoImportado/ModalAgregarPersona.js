import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField } from "@mui/material";
import MDButton from "components/MDButton";

export default function ModalAgregarPersona({
  open,
  onClose,
  personaData,
  onSave,
  token,
  setErrorAlert,
  fetchErroresMec,
}) {
  const [personaForm, setPersonaForm] = useState({
    legajo: "",
    dni: "",
    apellido: "",
    nombre: "",
    vigente: "S",
  });
  useEffect(() => {
    if (open && personaData) {
      setPersonaForm({
        legajo: personaData.legajo || "",
        dni: personaData.dni || "",
        apellido: personaData.apellido || "",
        nombre: personaData.nombre || "",
        vigente: "S",
      });
    } else if (!open) {
      setPersonaForm({
        legajo: "",
        dni: "",
        apellido: "",
        nombre: "",
        vigente: "S",
      });
    }
  }, [open, personaData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarPersona = async () => {
    const url = `${process.env.REACT_APP_API_URL}Personas/EFIPersona`;
    const Legajo = isNaN(Number(personaForm.legajo))
      ? personaForm.legajo
      : Number(personaForm.legajo);
    const DNI = String(personaForm.dni ?? "").trim();
    const Nombre = String(personaForm.nombre ?? "").trim();
    const Apellido = String(personaForm.apellido ?? "").trim();
    const Vigente = personaForm.vigente ?? "S";

    const flatData = { Legajo, DNI, Apellido, Nombre, Vigente };

    try {
      console.log("POST (flat) =>", url, flatData);
      const resp = await axios.post(url, flatData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("RESPUESTA (flat):", resp.status, resp.data);

      if (resp.status >= 200 && resp.status < 300) {
        onSave(resp.data);
        onClose();
        setErrorAlert({
          show: true,
          message: resp.data?.mensaje || "Persona guardada correctamente",
          type: "success",
        });
        await fetchErroresMec();
        return;
      }
      setErrorAlert({
        show: true,
        message: resp.data?.mensaje || `Error (${resp.status}) al guardar la persona.`,
        type: "error",
      });
    } catch (e) {
      const status = e.response?.status;
      const data = e.response?.data;
      console.error("ERROR guardar persona (flat):", { status, data });
      const hasValidationMissing =
        status === 400 &&
        data &&
        data.errors &&
        (data.errors.DNI || data.errors.Nombre || data.errors.Apellido || data.errors.Legajo);

      if (hasValidationMissing) {
        const wrappedData = { Dto: flatData };
        try {
          console.log("RETRY (wrapped Dto) =>", url, wrappedData);
          const resp2 = await axios.post(url, wrappedData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("RESPUESTA (wrapped):", resp2.status, resp2.data);
          if (resp2.status >= 200 && resp2.status < 300) {
            onSave(resp2.data);
            onClose();
            setErrorAlert({
              show: true,
              message: resp2.data?.mensaje || "Persona guardada correctamente",
              type: "success",
            });
            await fetchErroresMec();
            return;
          }
          setErrorAlert({
            show: true,
            message: resp2.data?.mensaje || `Error (${resp2.status}) al guardar la persona.`,
            type: "error",
          });
          return;
        } catch (e2) {
          console.error("ERROR guardar persona (wrapped):", {
            status: e2.response?.status,
            data: e2.response?.data,
          });
          setErrorAlert({
            show: true,
            message:
              e2.response?.data?.mensaje ||
              e2.response?.data?.Message ||
              e2.response?.data?.error ||
              "Error al guardar la persona.",
            type: "error",
          });
          return;
        }
      }
      setErrorAlert({
        show: true,
        message: data?.mensaje || data?.Message || data?.error || "Error al guardar la persona.",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Persona</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField
              label="Legajo"
              name="legajo"
              fullWidth
              value={personaForm.legajo}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="DNI"
              name="dni"
              fullWidth
              value={personaForm.dni}
              onChange={handleInputChange}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Apellido"
              name="apellido"
              fullWidth
              value={personaForm.apellido}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Nombre"
              name="nombre"
              fullWidth
              value={personaForm.nombre}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton color="secondary" size="small" variant="contained" onClick={onClose}>
          Cancelar
        </MDButton>
        <MDButton color="success" size="small" variant="contained" onClick={handleGuardarPersona}>
          Agregar persona
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}
ModalAgregarPersona.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  personaData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
  setErrorAlert: PropTypes.func.isRequired,
  fetchErroresMec: PropTypes.func.isRequired,
};
