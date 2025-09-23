import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import MDButton from "components/MDButton";
import "dayjs/locale/es";
import dayjs from "dayjs";

export default function ImportarInasistenciaModal({ open, onClose, cabecera, onSuccess }) {
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const minDate = dayjs(cabecera?.fechaMin || undefined);
  const maxDate = dayjs(cabecera?.fechaMax || undefined);

  const handleConfirm = async () => {
    if (!fechaDesde || !fechaHasta || fechaHasta.isBefore(fechaDesde)) return;

    setIsLoading(true);

    try {
      const desdeStr = dayjs(fechaDesde).format("YYYY-MM-DD");
      const hastaStr = dayjs(fechaHasta).format("YYYY-MM-DD");

      const url = `${process.env.REACT_APP_API_URL}docentesHistorico/ImportarInas`;
      await axios.post(url, null, {
        params: {
          desde: desdeStr,
          hasta: hastaStr,
          idCabecera: cabecera.idCabecera,
          idInasistenciasCabecera: cabecera.idInasistenciaCabecera,
        },
      });

      if (onSuccess) onSuccess(cabecera);
      onClose();
    } catch (error) {
      console.error("Error al importar inasistencias:", error);
      alert("Error al importar inasistencias.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? null : onClose}>
      <DialogContent pt={3} sx={{ display: "flex", gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <DatePicker
            label="Desde"
            format="DD-MM-YYYY"
            value={fechaDesde}
            onChange={(newValue) => setFechaDesde(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="Hasta"
            format="DD-MM-YYYY"
            value={fechaHasta}
            onChange={(newValue) => setFechaHasta(newValue)}
            renderInput={(params) => <TextField {...params} />}
            minDate={fechaDesde || minDate}
          />
        </LocalizationProvider>
      </DialogContent>

      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={1} p={2}>
          <CircularProgress color="info" size={16} />
          <Typography variant="body2" color="text.secondary">
            Cargando inasistencias...
          </Typography>
        </Box>
      )}

      <DialogActions>
        <MDButton size="small" variant="text" color="error" onClick={onClose} disabled={isLoading}>
          Cancelar
        </MDButton>
        <MDButton
          variant="contained"
          size="small"
          color="success"
          onClick={handleConfirm}
          disabled={!fechaDesde || !fechaHasta || fechaHasta.isBefore(fechaDesde) || isLoading}
        >
          Confirmar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

ImportarInasistenciaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cabecera: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};
