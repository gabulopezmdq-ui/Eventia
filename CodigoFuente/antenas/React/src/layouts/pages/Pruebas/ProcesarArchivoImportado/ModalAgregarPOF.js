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
  const initialForm = {
    idTipoCategoria: "",
    idCarRevista: "",
    horasDesignadas: "",
    anioAntiguedad: "",
    anioReferencia: "",
    mesAntiguedad: "",
    mesReferencia: "",
    secuencia: "",
    funcion: "",
    legajoEFI: "",
    documento: "",
    apellido: "",
    nombre: "",
    barra: "",
    tipoCargo: "",
    ue: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [caracteres, setCaracteres] = useState([]);
  const [funciones, setFunciones] = useState([]);

  const token = sessionStorage.getItem("token");

  const tipoCargoOptions = [
    { value: "C", label: "CARGO" },
    { value: "H", label: "HORAS" },
    { value: "M", label: "MÓDULOS" },
  ];

  // -----------------------------------------------------
  // 1️⃣ RESET TOTAL CUANDO CAMBIA PERSONA O SE ABRE MODAL
  // -----------------------------------------------------
  useEffect(() => {
    if (!open) {
      setFormData(initialForm);
      return;
    }

    if (!persona) {
      setFormData(initialForm);
      return;
    }

    setFormData({
      ...initialForm,
      ...persona,
      barra: Array.isArray(persona.barra) ? persona.barra.join(" ") : persona.barra ?? "",
    });
  }, [open, persona]);

  // -----------------------------------------------------
  // 2️⃣ FETCH DE SELECTS CUANDO SE ABRE EL MODAL
  // -----------------------------------------------------
  useEffect(() => {
    if (!token || !open) return;

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

        if (persona) {
          const cargoMEC = catRes.data.find((x) => x.idTipoCategoria === persona.cargoMEC);
          const caracterMEC = carRes.data.find((x) => x.idCarRevista === persona.caracterMEC);

          setFormData((prev) => ({
            ...prev,
            idTipoCategoria: cargoMEC?.idTipoCategoria || "",
            idCarRevista: caracterMEC?.idCarRevista || "",
          }));
        }
      } catch (error) {
        console.error("Error al obtener datos del backend:", error);
      }
    };

    fetchData();
  }, [token, open, persona]);

  // -----------------------------------------------------
  // 3️⃣ CUANDO TENGO FUNCIONES + PERSONA → RESUELVO FUNCIÓN
  // -----------------------------------------------------
  useEffect(() => {
    if (!persona || funciones.length === 0) return;

    const funcionEncontrada = funciones.find(
      (f) =>
        f.codFuncion?.toUpperCase() === persona.funcion?.toUpperCase() ||
        f.descripcion?.toUpperCase() === persona.funcion?.toUpperCase()
    );

    setFormData((prev) => ({
      ...prev,
      funcion: funcionEncontrada?.descripcion || persona.funcion || "",
    }));
  }, [persona, funciones]);

  // -----------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------------------------------
  // 4️⃣ GUARDAR POF
  // -----------------------------------------------------
  const handleSubmit = async () => {
    const barrasRaw = formData.barra;

    const Barras = Array.isArray(barrasRaw)
      ? barrasRaw.map((b) => String(b)).filter((b) => b.trim() !== "")
      : String(barrasRaw ?? "")
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

      onSave(response.data);
      onClose();
    } catch (error) {
      console.error("Error al guardar POF:", error.response?.data || error);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Agregar POF</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          {/* Datos base */}
          <Grid item xs={6}>
            <TextField label="Legajo" fullWidth value={formData.legajoEFI || ""} disabled />
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

          {/* Secuencia */}
          <Grid item xs={6}>
            <TextField
              label="Secuencia"
              name="secuencia"
              fullWidth
              value={formData.secuencia || ""}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Tipo cargo */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="tipo-cargo-label">Tipo Cargo</InputLabel>
              <Select
                labelId="tipo-cargo-label"
                name="tipoCargo"
                label="Tipo Cargo"
                style={{ height: "2.7rem" }}
                value={formData.tipoCargo || ""}
                onChange={handleInputChange}
              >
                {tipoCargoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {(formData.tipoCargo === "H" || formData.tipoCargo === "M") && (
            <Grid item xs={6}>
              <TextField
                label="Horas Designadas"
                name="horasDesignadas"
                type="number"
                fullWidth
                value={formData.horasDesignadas || ""}
                onChange={handleInputChange}
              />
            </Grid>
          )}

          {/* UE */}
          <Grid item xs={6}>
            <TextField
              label="UE"
              name="ue"
              fullWidth
              value={formData.ue || ""}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Barra */}
          <Grid item xs={6}>
            <TextField
              label="Barra"
              name="barra"
              fullWidth
              placeholder="Ej: 54 60 30 21"
              helperText="Separá con espacios o comas"
              value={String(formData.barra ?? "")}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Función */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="funcion-label">Función</InputLabel>
              <Select
                labelId="funcion-label"
                name="funcion"
                label="Función"
                style={{ height: "2.7rem" }}
                value={formData.funcion || ""}
                onChange={handleInputChange}
              >
                {funciones.map((funcion) => (
                  <MenuItem key={funcion.idTipoFuncion} value={funcion.descripcion}>
                    {funcion.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Cargo actual */}
          {persona?.cargo && (
            <Grid item xs={12}>
              <TextField label="Cargo Actual" fullWidth value={persona.cargo} disabled />
            </Grid>
          )}

          {/* Cargo MEC */}
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

          {/* Carácter actual */}
          {persona?.caracter && (
            <Grid item xs={12}>
              <TextField label="Carácter Actual" fullWidth value={persona.caracter} disabled />
            </Grid>
          )}

          {/* Carácter MEC */}
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

          {/* Antigüedad */}
          <Grid item xs={6}>
            <TextField
              label="Año Antigüedad"
              name="anioAntiguedad"
              type="number"
              fullWidth
              value={formData.anioAntiguedad || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Mes Antigüedad"
              name="mesAntiguedad"
              type="number"
              fullWidth
              value={formData.mesAntiguedad || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Año Referencia"
              name="anioReferencia"
              type="number"
              fullWidth
              value={formData.anioReferencia || ""}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Mes Referencia"
              name="mesReferencia"
              type="number"
              fullWidth
              value={formData.mesReferencia || ""}
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
