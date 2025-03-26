import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Modal, TextField, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const EditarModalAntiguedad = ({ isOpen, onClose, idPersona, token, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    mesReferencia: "",
    anioReferencia: "",
    mesAntiguedad: "",
    anioAntiguedad: "",
  });
  const [loading, setLoading] = useState(false);
  const [idPOFAntig, setidPOFAntig] = useState(null);
  const [errors, setErrors] = useState({});
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  useEffect(() => {
    if (isOpen && idPersona) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const responseAntig = await fetch(
            `${process.env.REACT_APP_API_URL}POFAntig/getbyidPersona?idPersona=${idPersona}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const dataAntig = await responseAntig.json();
          if (responseAntig.ok && dataAntig !== false) {
            setFormData({
              mesReferencia: dataAntig.mesReferencia ?? "",
              anioReferencia: dataAntig.anioReferencia ?? "",
              mesAntiguedad: dataAntig.mesAntiguedad ?? "",
              anioAntiguedad: dataAntig.anioAntiguedad ?? "",
            });
            setidPOFAntig(dataAntig.idPOFAntig || null);
            setNombre(dataAntig.persona?.nombre || "");
            setApellido(dataAntig.persona?.apellido || "");
          } else {
            const responsePOF = await fetch(
              `${process.env.REACT_APP_API_URL}Personas/getbyid?id=${idPersona}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (responsePOF.ok) {
              const dataPOF = await responsePOF.json();
              setNombre(dataPOF.nombre || "");
              setApellido(dataPOF.apellido || "");
            }
            setFormData({
              mesReferencia: "",
              anioReferencia: "",
              mesAntiguedad: "",
              anioAntiguedad: "",
            });
            setidPOFAntig(null);
          }
        } catch (error) {
          alert("Hubo un error al conectar con el servidor.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, idPersona, token]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        mesReferencia: "",
        anioReferencia: "",
        mesAntiguedad: "",
        anioAntiguedad: "",
      });
      setErrors({});
      setNombre("");
      setApellido("");
    }
  }, [isOpen]);

  const validateInput = (name, value) => {
    let error = "";

    switch (name) {
      case "mesReferencia":
        if (value < 1 || value > 12) error = "Debe estar entre 1 y 12.";
        break;
      case "anioReferencia":
        if (value < 2024 || value > 3000) error = "Debe estar entre 2024 y 3000.";
        break;
      case "anioAntiguedad":
        if (value < 0 || value > 99) error = "Debe ser menor o igual a 99.";
        break;
      case "mesAntiguedad":
        if (value < 0 || value > 11) error = "Debe estar entre 0 y 11.";
        break;
      default:
        break;
    }

    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateInput(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Corrige los errores antes de continuar.");
      return;
    }

    try {
      setLoading(true);

      const url = idPOFAntig
        ? `${process.env.REACT_APP_API_URL}POFAntig`
        : `${process.env.REACT_APP_API_URL}POFAntig`;

      const method = idPOFAntig ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idPersona: idPersona,
          ...formData,
          ...(idPOFAntig && { idPOFAntig }),
        }),
      });

      if (response.ok) {
        setLoading(false);
        if (onEditSuccess) {
          onEditSuccess();
        }
        onClose();
      } else {
        setLoading(false);
        alert("Hubo un error al guardar los datos. Verifique e intente nuevamente.");
      }
    } catch (error) {
      setLoading(false);
      alert("Hubo un error al conectar con el servidor. Intente más tarde.");
    }
  };

  /*const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) && value !== "") return;

    setFormData((prevState) => ({ ...prevState, [name]: numericValue || "" }));
    const error = validateInput(name, numericValue);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };*/
  const handleInputChange = (e) => {
    // permite agregar 0
    const { name, value } = e.target;
    const numericValue = value === "" ? "" : Number(value);

    setFormData((prevState) => ({ ...prevState, [name]: numericValue }));

    const error = validateInput(name, numericValue);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
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

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-title">
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress color="info" />
          </Box>
        ) : (
          <>
            <MDTypography mb={2} variant="body1" id="modal-title">
              Editar Antigüedad
            </MDTypography>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={`${nombre} ${apellido}`}
                  disabled
                />
              </Grid>
            </Grid>
            <div style={{ marginBottom: "25px", fontSize: "15px", color: "#bbbbbb" }}>
              El mes y año de referencia son clave para calcular la antigüedad. Ej: si para 01/2024
              el docente tenía 3 meses y 11 años de antigüedad, cualquier fecha distinta se
              calculará a partir de esos datos cargados, ajustando la antigüedad según corresponda.
            </div>
            <Grid container spacing={3}>
              {[
                { name: "mesReferencia", label: "Mes Referencia" },
                { name: "anioReferencia", label: "Año Referencia" },
                { name: "mesAntiguedad", label: "Mes Antigüedad" },
                { name: "anioAntiguedad", label: "Año Antigüedad" },
              ].map(({ name, label }) => (
                <Grid item xs={6} key={name}>
                  <TextField
                    fullWidth
                    type="number"
                    label={label}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    error={!!errors[name]}
                    helperText={errors[name]}
                  />
                </Grid>
              ))}
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

EditarModalAntiguedad.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  idPersona: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  onEditSuccess: PropTypes.func.isRequired,
};

export default EditarModalAntiguedad;
