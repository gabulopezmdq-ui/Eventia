import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Modal,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const EditarModal = ({ isOpen, onClose, idPof, token, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    secuencia: "",
    tipoCargo: "",
    idFuncion: "",
    idCategoria: "",
    idCarRevista: "",
    idEstablecimiento: "",
    idPersona: null,
    vigente: "S",
  });
  const [categorias, setCategorias] = useState([]);
  const [establecimientoNombre, setEstablecimientoNombre] = useState("");
  const [carRevista, setCarRevista] = useState([]);
  const [funcion, setFuncion] = useState([]);
  const [barras, setBarras] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && idPof) {
      const fetchData = async () => {
        try {
          setLoading(true);
          // 1. Cargar datos principales del POF
          const pofResponse = await fetch(
            `${process.env.REACT_APP_API_URL}pof/GetById?id=${idPof}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const pofData = await pofResponse.json();
          // 2. Cargar barras actualizadas
          const barrasResponse = await fetch(
            `${process.env.REACT_APP_API_URL}POF/GetPOFBarras?idPOF=${idPof}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const barrasData = await barrasResponse.json();
          setFormData({
            secuencia: pofData.secuencia || "",
            tipoCargo: pofData.tipoCargo || "",
            idFuncion: pofData.idFuncion || "",
            idCategoria: pofData.idCategoria || "",
            idCarRevista: pofData.idCarRevista || "",
            idEstablecimiento: pofData.establecimiento?.idEstablecimiento || "",
            idPersona: pofData.idPersona || null,
            vigente: pofData.vigente || "",
          });
          setEstablecimientoNombre(pofData.establecimiento?.nroEstablecimiento || "");
          setBarras(barrasData);
          setLoading(false);
        } catch (error) {
          console.error("Error al obtener los datos:", error);
          setLoading(false);
        }
      };

      // 3. Cargar datos complementarios (solo se necesitan una vez)
      const fetchComplementaryData = async () => {
        const fetchCategorias = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}TiposCategorias/getall`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            const categoriasVigentes = data
              .filter((categoria) => categoria.vigente === "S")
              .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
            setCategorias(categoriasVigentes);
          } catch (error) {
            console.error("Error al cargar categorías:", error);
          }
        };

        const fetchCarRevistas = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}CarRevista/getall`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            const carRevistaVigentes = data
              .filter((carRevista) => carRevista.vigente === "S")
              .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
            setCarRevista(carRevistaVigentes);
          } catch (error) {
            console.error("Error al cargar cargos de revista:", error);
          }
        };

        const fetchFuncion = async () => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}TiposFunciones/getall`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            const funcionesVigentes = data
              .filter((funcion) => funcion.vigente === "S")
              .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
            setFuncion(funcionesVigentes);
          } catch (error) {
            console.error("Error al cargar funciones:", error);
          }
        };

        fetchFuncion();
        fetchCarRevistas();
        fetchCategorias();
      };

      fetchData();
      fetchComplementaryData();
    }
  }, [isOpen, idPof, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["secuencia", "idCarRevista", "idFuncion", "tipoCargo", "idCategoria"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Faltan completar los siguientes campos: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL}POF`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idPOF: idPof,
          ...formData,
          Barra: barras.map((b) => b.barra).join(","), // 👈 CLAVE
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      if (onEditSuccess) {
        onEditSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert(error?.errors?.Barra?.[0] || "Hubo un error al actualizar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "0.5rem",
  };

  const tipoCargoOptions = [
    { value: "C", label: "CARGO" },
    { value: "H", label: "HORAS" },
    { value: "M", label: "MODULOS" },
  ];
  const tipoVigenteOptions = [
    { value: "S", label: "Si" },
    { value: "N", label: "No" },
  ];

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-title">
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <MDTypography variant="body2" mr={2}>
              Procesando la edicion
            </MDTypography>
            <CircularProgress color="info" />
          </Box>
        ) : (
          <>
            <MDTypography mb={2} variant="body1" id="modal-title">
              Editar Datos
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Establecimiento"
                  value={establecimientoNombre}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Secuencia"
                  name="secuencia"
                  value={formData.secuencia}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="tipoCargo-select-label"> Tipo Cargo </InputLabel>
                  <Select
                    labelId="tipoCargo-select-label"
                    label="tipoCargo"
                    value={formData.tipoCargo}
                    onChange={handleInputChange}
                    name="tipoCargo"
                    style={{ height: "2.5rem", backgroundColor: "white" }}
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
                <FormControl fullWidth>
                  <InputLabel id="car-revista-select-label">Car. Revista</InputLabel>
                  <Select
                    labelId="car-revista-select-label"
                    name="idCarRevista"
                    label="Car. Revista"
                    value={formData.idCarRevista}
                    onChange={handleInputChange}
                    style={{ height: "2.5rem", backgroundColor: "white" }}
                  >
                    {carRevista.map((carRevista) => (
                      <MenuItem key={carRevista.idCarRevista} value={carRevista.idCarRevista}>
                        {carRevista.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="funcion-select-label">Funcion</InputLabel>
                  <Select
                    labelId="funcion-select-label"
                    name="idFuncion"
                    label="Funcion"
                    value={formData.idFuncion}
                    onChange={handleInputChange}
                    style={{ height: "2.5rem", backgroundColor: "white" }}
                  >
                    {funcion.map((funcionItem) => (
                      <MenuItem key={funcionItem.idTipoFuncion} value={funcionItem.idTipoFuncion}>
                        {funcionItem.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="categoria-select-label">Categoría</InputLabel>
                  <Select
                    labelId="categoria-select-label"
                    name="idCategoria"
                    label="Categoria"
                    value={formData.idCategoria}
                    onChange={handleInputChange}
                    style={{ height: "2.5rem", backgroundColor: "white" }}
                  >
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria.idTipoCategoria} value={categoria.idTipoCategoria}>
                        {categoria.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="tipoVigente-select-label"> Vigente </InputLabel>
                  <Select
                    labelId="tipoVigente-select-label"
                    value={formData.vigente}
                    onChange={handleInputChange}
                    name="vigente"
                    label="Vigente"
                    style={{ height: "2.5rem", backgroundColor: "white" }}
                  >
                    {tipoVigenteOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {barras.length === 0 ? (
                  <MDTypography variant="subtitle2">No hay barras disponibles</MDTypography>
                ) : (
                  <>
                    <MDTypography variant="subtitle2">Barras disponibles : </MDTypography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {barras.map((barra) => (
                        <Chip
                          key={barra.idPOFBarra}
                          label={barra.barra}
                          variant="contained"
                          size="small"
                          color="info"
                          disabled
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Grid>
            </Grid>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <MDButton
                variant="contained"
                size="small"
                color="error"
                onClick={onClose}
                style={{ marginRight: "10px" }}
              >
                Cancelar
              </MDButton>
              <MDButton type="submit" size="small" variant="contained" color="info">
                Guardar
              </MDButton>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

EditarModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  idPof: PropTypes.number,
  token: PropTypes.string.isRequired,
  onEditSuccess: PropTypes.func.isRequired,
};

export default EditarModal;
