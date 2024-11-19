import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "../../Pruebas/pruebas.css";
import MDInput from "components/MDInput";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import DataTable from "examples/Tables/DataTable";
import FormField from "layouts/pages/account/components/FormField";

function PlantaFuncional() {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState("");
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState([]);
  const [establecimientoNombre, setEstablecimientoNombre] = useState("");
  const [dni, setDni] = useState("");
  const token = sessionStorage.getItem("token");
  const [verificarRespuesta, setVerificarRespuesta] = useState(null);
  const [pofVisible, setPofVisible] = useState(false);
  const [idPersona, setIdPersona] = useState(null);
  const [carRevistaOptions, setCarRevistaOptions] = useState([]);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [formData, setFormData] = useState({
    apellido: "",
    nombre: "",
    legajo: "",
    vigente: "S",
    dni: "",
  });
  const [pofFormData, setPofFormData] = useState({
    secuencia: "",
    carRevista: "",
    funcion: "",
    tipoCargo: "",
    barra: "",
    categorias: "",
  });

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}Establecimientos/getall`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEstablecimientos(response.data);
      } catch (error) {
        console.error("Error al cargar los establecimientos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEstablecimientos();
  }, [token]);

  const handleChange = (event) => {
    const selectedId = event.target.value;
    const selectedEstablecimiento = establecimientos.find(
      (establecimiento) => establecimiento.idEstablecimiento === selectedId
    );
    setSelectedEstablecimiento(selectedId);
    setEstablecimientoNombre(selectedEstablecimiento?.nroEstablecimiento || "");
  };

  const handleCargar = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}POF/GetByIdEstablecimiento?IdEstablecimiento=${selectedEstablecimiento}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const personasData = response.data.map((item) => ({
        nombre: item.persona.nombre,
        apellido: item.persona.apellido,
        dni: item.persona.dni,
        legajo: item.persona.legajo,
      }));
      setPersonas(personasData);
    } catch (error) {
      console.error("Error al realizar la petición POST:", error);
      alert("Hubo un error al enviar los datos.");
    }
  };

  const handleAgregar = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}POF/VerificarPOF`,
        { DNI: dni },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;

      if (data.item1) {
        setVerificarRespuesta(true);
        setPofVisible(true);
        setFormData({
          apellido: data.item2.apellido,
          nombre: data.item2.nombre,
          legajo: data.item2.legajo,
          vigente: data.item2.vigente,
          dni: data.item2.dni,
        });
      } else {
        setVerificarRespuesta(false);
        setPofVisible(false);
        setFormData({
          apellido: "",
          nombre: "",
          legajo: "",
          vigente: "S",
          dni: dni,
        });
      }
    } catch (error) {
      console.error("Error al verificar:", error);
      alert("Hubo un error al verificar el DNI.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonaSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}pof/POFPersona`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIdPersona(response.data.idPersona);
      setPofVisible(true);
    } catch (error) {
      console.error("Error al crear la persona:", error);
      alert("Hubo un error al enviar los datos.");
    }
  };
  const handlePofChange = (e) => {
    const { name, value } = e.target;
    setPofFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePofSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}pof/RegistrarPOF`,
        {
          ...pofFormData,
          establecimiento: selectedEstablecimiento,
          idPersona,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Formulario POF enviado con éxito.");
    } catch (error) {
      console.error("Error al enviar formulario POF:", error);
      alert("Error al enviar el formulario POF.");
    }
  };

  useEffect(() => {
    const fetchCarRevistas = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}CarRevista/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCarRevistaOptions(response.data);
      } catch (error) {
        console.error("Error al cargar CarRevistas:", error);
      }
    };

    const fetchFunciones = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}TiposFunciones/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFunciones(response.data);
      } catch (error) {
        console.error("Error al cargar Funciones:", error);
      }
    };
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}TiposCategorias/getall`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategoriasOptions(response.data);
      } catch (error) {
        console.error("Error al cargar CarRevistas:", error);
      }
    };
    fetchCarRevistas();
    fetchFunciones();
    fetchCategorias();
  }, [token]);

  const tipoCargoOptions = [
    { value: "C", label: "CARGO" },
    { value: "H", label: "HORAS" },
    { value: "M", label: "MODULOS" },
  ];

  return (
    <>
      <DashboardLayout>
        <p>hola</p>
        <DashboardNavbar />
        <MDBox my={3}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="establecimiento-select-label"> Establecimiento </InputLabel>
                <Select
                  labelId="establecimiento-select-label"
                  value={selectedEstablecimiento}
                  onChange={handleChange}
                  label="Establecimiento"
                  style={{ height: "2.5rem", backgroundColor: "white" }}
                >
                  {establecimientos.map((establecimiento) => (
                    <MenuItem
                      key={establecimiento.idEstablecimiento}
                      value={establecimiento.idEstablecimiento}
                    >
                      {establecimiento.nroEstablecimiento}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <MDBox>
                <MDButton variant="gradient" color="info" size="small" onClick={handleCargar}>
                  Cargar
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        {personas.length > 0 && (
          <>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "Nombre", accessor: "nombre" },
                    { Header: "Apellido", accessor: "apellido" },
                    { Header: "DNI", accessor: "dni" },
                    { Header: "Legajo", accessor: "legajo" },
                  ],
                  rows: personas,
                }}
                entriesPerPage={false}
                canSearch
              />
            </Card>
            <MDBox mt={2}>
              <Card m={2}>
                <MDBox component="form" m={2}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="DNI"
                        name="Dni"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                      />
                    </Grid>
                    <MDBox mt={3} ml={2}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        onClick={handleAgregar}
                      >
                        Verificar Persona
                      </MDButton>
                    </MDBox>
                  </Grid>
                </MDBox>
              </Card>
            </MDBox>
            {verificarRespuesta !== null && (
              <MDBox mt={2}>
                <MDAlert className="custom-alert">
                  <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
                  <MDTypography ml={1} variant="button">
                    Datos Persona
                  </MDTypography>
                </MDAlert>
                <Card mt={3}>
                  <MDBox p={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormField
                          label="Apellido"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleFormChange}
                          disabled={verificarRespuesta}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormField
                          label="Nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleFormChange}
                          disabled={verificarRespuesta}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormField
                          label="Legajo"
                          name="legajo"
                          value={formData.legajo}
                          onChange={handleFormChange}
                          disabled={verificarRespuesta}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormField label="DNI" name="dni" value={formData.dni} disabled />
                      </Grid>
                    </Grid>
                    {!verificarRespuesta && (
                      <MDBox mt={3}>
                        <MDButton
                          variant="gradient"
                          color="success"
                          size="small"
                          onClick={handlePersonaSubmit}
                        >
                          Enviar Persona
                        </MDButton>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </MDBox>
            )}
            {pofVisible && (
              <MDBox mt={3}>
                <MDAlert className="custom-alert">
                  <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
                  <MDTypography ml={1} variant="button">
                    Datos POF
                  </MDTypography>
                </MDAlert>
                <Card mt={3}>
                  <MDBox p={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormField
                          label="Establecimiento"
                          name="establecimientoNombre"
                          value={establecimientoNombre}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormField
                          label="Secuencia"
                          name="secuencia"
                          value={pofFormData.secuencia}
                          onChange={handlePofChange}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormField
                          label="Barra"
                          name="barra"
                          value={pofFormData.barra}
                          onChange={handlePofChange}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="car-revista-select-label">Car. Revista</InputLabel>
                          <Select
                            labelId="car-revista-select-label"
                            name="carRevista"
                            value={pofFormData.carRevista}
                            onChange={handlePofChange}
                            label="Car. Revista"
                            style={{ height: "2.5rem", backgroundColor: "white" }}
                          >
                            {carRevistaOptions.map((option) => (
                              <MenuItem key={option.idCarRevista} value={option.idCarRevista}>
                                {option.descripcion}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="categorias-select-label">Categorias</InputLabel>
                          <Select
                            labelId="categorias-select-label"
                            name="categorias"
                            value={pofFormData.categorias}
                            onChange={handlePofChange}
                            label="categorias"
                            style={{ height: "2.5rem", backgroundColor: "white" }}
                          >
                            {categoriasOptions.map((option) => (
                              <MenuItem key={option.idTipoCategoria} value={option.idTipoCategoria}>
                                {option.descripcion}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="funcion-select-label">Función</InputLabel>
                          <Select
                            labelId="funcion-select-label"
                            value={pofFormData.funcion}
                            onChange={handlePofChange}
                            name="funcion"
                            style={{ height: "2.5rem", backgroundColor: "white" }}
                          >
                            {funciones.map((funcion) => (
                              <MenuItem key={funcion.idTipoFuncion} value={funcion.idTipoFuncion}>
                                {funcion.descripcion}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel id="tipoCargo-select-label">Tipo Cargo</InputLabel>
                          <Select
                            labelId="tipoCargo-select-label"
                            value={pofFormData.tipoCargo}
                            onChange={handlePofChange}
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
                    </Grid>
                    <MDBox mt={3}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        size="small"
                        onClick={handlePofSubmit}
                      >
                        Enviar POF
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </MDBox>
            )}
          </>
        )}
      </DashboardLayout>
    </>
  );
}

PlantaFuncional.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default PlantaFuncional;
