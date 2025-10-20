import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Chip,
  Box,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Close, CalendarToday, Receipt, Description } from "@mui/icons-material";
import MDButton from "components/MDButton";

export default function DetallePopup({ open, onClose, detalle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!detalle) return null;

  const fullRowFields = ["observaciones", "observacionDetalle", "comentarios", "notas"];

  const dateFields = ["fecha", "fechaCreacion", "fechaMovimiento", "fechaVencimiento"];

  const formatLabel = (key) => {
    const labels = {
      observaciones: "Observaciones",
      observacionDetalle: "Detalle de Observaciones",
      fecha: "Fecha",
      monto: "Monto",
      importe: "Importe",
    };
    return (
      labels[key] ||
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, "$1 $2")
    );
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (dateFields.includes(key) && value) {
      try {
        return new Date(value).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch {
        return value;
      }
    }
    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }
    return value;
  };

  // Función para obtener icono según el tipo de campo
  const getFieldIcon = (key) => {
    if (dateFields.includes(key)) return <CalendarToday sx={{ fontSize: 16 }} />;
    if (fullRowFields.includes(key)) return <Description sx={{ fontSize: 16 }} />;
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "white",
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          📋 Detalle del Movimiento
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          size="small"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {Object.entries(detalle).map(([key, value]) => {
              const formattedValue = formatValue(key, value);
              const isFullRow = fullRowFields.includes(key);
              const fieldIcon = getFieldIcon(key);
              return (
                <Grid item xs={12} sm={isFullRow ? 12 : 6} key={key}>
                  {/* Campos de texto largos */}
                  {isFullRow ? (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          fontWeight: 600,
                        }}
                      >
                        {fieldIcon}
                        {formatLabel(key)}
                      </Typography>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "grey.200",
                          minHeight: "80px",
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {formattedValue}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    // Campos regulares
                    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        {fieldIcon}
                        {formatLabel(key)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          wordBreak: "break-word",
                        }}
                      >
                        {formattedValue}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "grey.50" }}>
        <MDButton
          onClick={onClose}
          color="error"
          variant="gradient"
          size="small"
          startIcon={<Close />}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          Cerrar
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

DetallePopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detalle: PropTypes.object,
};
