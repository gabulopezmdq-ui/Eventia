import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import MDButton from "components/MDButton";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const AgregarInasistenciaModal = ({ open, onClose, row, onConfirm }) => {
  const [pof, setPof] = useState(null); // objeto completo del POF seleccionado
  const [barra, setBarra] = useState("");
  const [opciones, setOpciones] = useState([]);
  useEffect(() => {
    if (open && row) {
      const fetchOpciones = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}inasistenciasCabecera/POF?dni=${row.tmpDetalle.dni}&legajo=${row.tmpDetalle.nroLegajo}`
          );
          const dataArray = Array.isArray(response.data) ? response.data : [response.data];
          setOpciones(dataArray);
        } catch (error) {
          console.error("Error al obtener opciones:", error);
          setOpciones([]);
        }
      };
      fetchOpciones();
    }
  }, [open, row]);
  const formatDateForBackend = (dateStr) => {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const handleConfirm = () => {
    const payload = {
      idCabeceraInasistencia: row.tmpDetalle.idInasistenciaCabecera,
      idPOF: pof.idPOF,
      idPOFBarra: barra,
      idEstablecimiento: row.idEstablecimiento,
      idTMPInasistenciasDetalle: row.tmpDetalle.idTMPInasistenciasDetalle,
      codLicencia: row.tmpDetalle.codLicen,
      fecha: formatDateForBackend(row.tmpDetalle.fecNov),
      cantHs: row.tmpDetalle.hora,
    };
    onConfirm(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Agregar Inasistencia {row?.tmpDetalle.dni}</DialogTitle>
      <DialogContent>
        {/* Select POF */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>POF</InputLabel>
          <Select
            value={pof?.dni || ""}
            label="POF"
            style={{ height: "2.8rem", backgroundColor: "white" }}
            onChange={(e) => {
              const seleccionado = opciones.find((o) => o.dni === e.target.value);
              setPof(seleccionado);
              setBarra(""); // reseteamos la barra al cambiar el POF
            }}
          >
            {opciones.map((opcion, index) => (
              <MenuItem key={index} value={opcion.dni}>
                {opcion.dni} {opcion.apellido} {opcion.nombre}, Legajo {opcion.legajo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }} disabled={!pof}>
          <InputLabel>Barra</InputLabel>
          <Select
            label="Barra"
            style={{ height: "2.8rem", backgroundColor: "white" }}
            value={barra}
            onChange={(e) => setBarra(e.target.value)}
          >
            {pof?.barrasDetalle?.map((b) => (
              <MenuItem key={b.idPOFBarra} value={b.idPOFBarra}>
                {b.barra}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <MDButton onClick={onClose} size="small" variant="text" color="error">
          Cancelar
        </MDButton>
        <MDButton onClick={handleConfirm} color="success" size="small" variant="contained">
          Confirmar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

AgregarInasistenciaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  row: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
};

export default AgregarInasistenciaModal;
