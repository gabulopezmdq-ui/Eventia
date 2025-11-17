import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MDButton from "components/MDButton";

export default function ModalAgregarPOF({ open, onClose, persona, onSave }) {
  const [formData, setFormData] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [caracteres, setCaracteres] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const token = sessionStorage.getItem("token");

  const tipoCargoOptions = [
    { value: "C", label: "CARGO" },
    { value: "H", label: "HORAS" },
    { value: "M", label: "MÓDULOS" },
  ];

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [funcRes, catRes, carRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}TiposFunciones/getall`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}TiposCategorias/getall`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}CarRevista/getall`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const funcionesVigentes = funcRes.data.filter((f) => f.vigente === "S");
        setFunciones(funcionesVigentes);
        setCategorias(catRes.data);
        setCaracteres(carRes.data);
      } catch (error) {
        console.error("Error al obtener datos del backend:", error);
      }
    };

    if (open) fetchData();
  }, [token, open]);

  useEffect(() => {
    if (persona && funciones.length > 0) {
      const funcionEncontrada = funciones.find(
        (f) =>
          f.codFuncion?.toUpperCase() === persona.funcion?.toUpperCase() ||
          f.descripcion?.toUpperCase() === persona.funcion?.toUpperCase()
      );

      setFormData({
        ...persona,
        idTipoCategoria: persona.idTipoCategoria || "",
        idCarRevista: persona.idCarRevista || "",
        tipoCargo: persona.tipoCargo || "",
        funcion: funcionEncontrada?.descripcion || persona.funcion || "",
        barra: Array.isArray(persona.barra) ? persona.barra.join(" ") : String(persona.barra ?? ""),
      });
    } else if (persona) {
      setFormData({
        ...persona,
        idTipoCategoria: persona.idTipoCategoria || "",
        idCarRevista: persona.idCarRevista || "",
        tipoCargo: persona.tipoCargo || "",
        barra: Array.isArray(persona.barra) ? persona.barra.join(" ") : String(persona.barra ?? ""),
      });
    }
  }, [persona, funciones]);

  if (!persona) return null;

  // 🔹 Handlers
  const handleCategoriaChange = (e) => {
    const selectedId = e.target.value;
    const categoriaSeleccionada = categorias.find((c) => c.idTipoCategoria === selectedId);
    setFormData((prev) => ({
      ...prev,
      idTipoCategoria: selectedId,
      cargo: categoriaSeleccionada?.descripcion || "",
    }));
  };

  const handleCaracterChange = (e) => {
    const selectedId = e.target.value;
    const caracterSeleccionado = caracteres.find((c) => c.idCarRevista === selectedId);
    setFormData((prev) => ({
      ...prev,
      idCarRevista: selectedId,
      caracter: caracterSeleccionado?.descripcion || "",
    }));
  };

  const handleFuncionChange = (e) => {
    const selectedDescripcion = e.target.value;
    setFormData((prev) => ({
      ...prev,
      funcion: selectedDescripcion,
    }));
  };

  const handleTipoCargoChange = (e) => {
    const selectedValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      tipoCargo: selectedValue,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const barrasRaw = formData.barra;
    const Barras = Array.isArray(barrasRaw)
      ? barrasRaw.map((b) => String(b)).filter((b) => b.trim() !== "")
      : barrasRaw == null
      ? []
      : String(barrasRaw)
          .split(/[ ,]+/)
          .map((b) => b.trim())
          .filter((b) => b !== "");

    const dataToSend = {
      Dto: { ...formData, barra: String(formData.barra ?? "") },
      Barras,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}pof/EFIPOF`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(response.data);

      // 👉 le paso al padre la respuesta (por si quiere mostrar el mensaje)
      onSave(response.data);

      // (opcional) si querés sacar el alert del modal:
      // alert(response.data.mensaje);

      onClose();
    } catch (error) {
      console.error("Error al guardar POF:", error.response?.data || error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Agregar POF</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField label="Legajo" fullWidth value={formData.legajo || ""} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Documento" fullWidth value={formData.documento || ""} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Apellido" fullWidth value={formData.apellido || ""} disabled />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Nombre" fullWidth value={formData.nombre || ""} disabled />
          </Grid>
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
            <FormControl fullWidth>
              <InputLabel id="tipo-cargo-label">Tipo Cargo</InputLabel>
              <Select
                labelId="tipo-cargo-label"
                name="tipoCargo"
                label="Tipo Cargo"
                style={{ height: "2.7rem" }}
                value={formData.tipoCargo || ""}
                onChange={handleTipoCargoChange}
              >
                {tipoCargoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              placeholder="Ej: 54 60 30 21"
              helperText="Podés separar con espacios o comas"
              value={String(formData.barra ?? "")}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="funcion-label">Función</InputLabel>
              <Select
                labelId="funcion-label"
                name="funcion"
                label="Función"
                style={{ height: "2.7rem" }}
                value={formData.funcion || ""}
                onChange={handleFuncionChange}
              >
                {funciones.map((funcion) => (
                  <MenuItem key={funcion.idTipoFuncion} value={funcion.descripcion}>
                    {funcion.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {persona.cargo && (
            <Grid item xs={12}>
              <TextField label="Cargo Actual" fullWidth value={persona.cargo} disabled />
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
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.idTipoCategoria} value={categoria.idTipoCategoria}>
                    {categoria.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {persona.caracter && (
            <Grid item xs={12}>
              <TextField label="Carácter Actual" fullWidth value={persona.caracter} disabled />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="caracter-label">Carácter</InputLabel>
              <Select
                labelId="caracter-label"
                name="idCarRevista"
                label="Carácter"
                style={{ height: "2.7rem" }}
                value={formData.idCarRevista || ""}
                onChange={handleCaracterChange}
              >
                {caracteres.map((caracter) => (
                  <MenuItem key={caracter.idCarRevista} value={caracter.idCarRevista}>
                    {caracter.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
