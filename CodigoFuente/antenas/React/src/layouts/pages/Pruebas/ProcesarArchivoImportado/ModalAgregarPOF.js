import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MDButton from "components/MDButton";

export default function ModalAgregarPOF({ open, onClose, persona, onSave }) {
  const [formData, setFormData] = useState({});
  const [categorias, setCategorias] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (persona) {
      // Inicializar formData con los datos de persona
      setFormData({
        ...persona,
        idTipoCategoria: persona.idTipoCategoria || "", // Asegurar que existe el campo para el select
      });
    }

    const fetchCategorias = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const result = await axios.get(`${process.env.REACT_APP_API_URL}TiposCategorias/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCategorias(result.data);
      } catch (error) {
        console.error("Error al obtener categorías", error);
      }
    };

    fetchCategorias();
  }, [persona]);

  if (!persona) return null;

  const handleCategoriaChange = (e) => {
    const selectedId = e.target.value;
    const categoriaSeleccionada = categorias.find((c) => c.idTipoCategoria === selectedId);

    setFormData((prev) => ({
      ...prev,
      idTipoCategoria: selectedId, // Guardar el ID de la categoría
      cargo: categoriaSeleccionada?.descripcion || "", // Actualizar el campo cargo con la descripción
    }));
  };

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
              label="Función"
              name="funcion"
              fullWidth
              value={formData.funcion || ""}
              onChange={handleInputChange}
            />
          </Grid>
          {/* Campo de solo lectura para mostrar el cargo actual */}
          {formData.cargo && (
            <Grid item xs={12}>
              <TextField label="Cargo Actual" fullWidth value={formData.cargo} disabled />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="cargo-label">Cargo</InputLabel>
              <Select
                labelId="cargo-label"
                name="idTipoCategoria"
                label="Cargo"
                style={{ height: "2.7rem" }}
                value={formData.idTipoCategoria || ""}
                onChange={handleCategoriaChange}
              >
                {/* Opciones de las categorías */}
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.idTipoCategoria} value={categoria.idTipoCategoria}>
                    {categoria.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
