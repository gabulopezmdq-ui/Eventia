import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import MDButton from "components/MDButton";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Typography from "@mui/material/Typography";

import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const InasistenciaModal = ({ open, onClose, onConfirm, mes, anio, initialData, isLoading }) => {
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);

  useEffect(() => {
    if (open) {
      setFechaDesde(dayjs(new Date(anio, mes - 1, 1)));
      setFechaHasta(dayjs(new Date(anio, mes, 0)));
    } else {
      setFechaDesde(null);
      setFechaHasta(null);
    }
  }, [open, mes, anio]);

  const minDate = dayjs(new Date(anio, mes - 1, 1));
  const maxDate = dayjs(new Date(anio, mes, 0));

  return (
    <Dialog open={open} onClose={isLoading ? null : onClose}>
      <DialogContent pt={3} sx={{ display: "flex", gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <DatePicker
            label="Desde"
            value={fechaDesde}
            onChange={(newValue) => setFechaDesde(newValue)}
            renderInput={(params) => <TextField {...params} />}
            minDate={minDate}
            maxDate={maxDate}
          />
          <DatePicker
            label="Hasta"
            value={fechaHasta}
            onChange={(newValue) => setFechaHasta(newValue)}
            renderInput={(params) => <TextField {...params} />}
            minDate={fechaDesde || minDate}
            maxDate={maxDate}
          />
        </LocalizationProvider>
      </DialogContent>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          <CircularProgress color="info" size={16} />
          <Typography variant="body2" color="text.secondary">
            Cargando inasistencias...
          </Typography>
        </Box>
      )}
      <DialogActions>
        <MDButton size="small" variant="text" color="error" onClick={onClose}>
          Cancelar
        </MDButton>
        <MDButton
          variant="contained"
          size="small"
          color="success"
          onClick={() => {
            onConfirm({ ...initialData, fechaDesde, fechaHasta });
          }}
          disabled={!fechaDesde || !fechaHasta || fechaHasta.isBefore(fechaDesde) || isLoading}
        >
          Confirmar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

InasistenciaModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  mes: PropTypes.number.isRequired,
  anio: PropTypes.number.isRequired,
  initialData: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default InasistenciaModal;
