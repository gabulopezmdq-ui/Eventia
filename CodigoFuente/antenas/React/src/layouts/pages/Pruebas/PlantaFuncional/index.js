import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "../../Pruebas/pruebas.css";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import DataTable from "examples/Tables/DataTable";
import EditarModal from "./EditarModal";
import ModalBarras from "./ModalBarras";
import FormField from "layouts/pages/account/components/FormField";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function PlantaFuncional() {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState("");
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [establecimientoNombre, setEstablecimientoNombre] = useState("");
  const [dni, setDni] = useState("");
  const token = sessionStorage.getItem("token");
  const [verificarRespuesta, setVerificarRespuesta] = useState(null);
  const [pofVisible, setPofVisible] = useState(false);
  const [idPersona, setIdPersona] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertPOF, setAlertPOF] = useState(false);
  const [alertPersona, setAlertPersona] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [alertaDNI, setAlertaDNI] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [carRevistaOptions, setCarRevistaOptions] = useState([]);
  const [categoriasOptions, setCategoriasOptions] = useState([]);
  const [funciones, setFunciones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalBarrasOpen, setIsModalBarrasOpen] = useState(false);
  const [selectedIdPof, setSelectedIdPof] = useState(null);
  const [dataTableData, setDataTableData] = useState([]);
  const [formData, setFormData] = useState({
    apellido: "",
    nombre: "",
    legajo: "",
    vigente: "S",
    dni: "",
  });
  const [pofFormData, setPofFormData] = useState({
    secuencia: "",
    idCarRevista: "",
    idFuncion: "",
    tipoCargo: "",
    barra: "",
    idCategoria: "",
    vigente: "S",
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

  const handleDownloadExcel = () => {
    if (personas.length === 0) return; // evita exportar si no hay datos
    const worksheet = XLSX.utils.json_to_sheet(personas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats‑officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Personas.xlsx");
  };

  const handleChange = (event) => {
    const selectedId = event.target.value;
    const selectedEstablecimiento = establecimientos.find(
      (establecimiento) => establecimiento.idEstablecimiento === selectedId
    );
    setSelectedEstablecimiento(selectedId);
    setEstablecimientoNombre(selectedEstablecimiento?.nombrePcia || "");
    setPersonas([]);
    setDni("");
    setIsDataLoaded(false);
    setPofVisible(false);
    setPofFormData({
      secuencia: "",
      idCarRevista: "",
      idFuncion: "",
      tipoCargo: "",
      barra: "",
      idCategoria: "",
      vigente: "S",
    });
    setVerificarRespuesta(null);
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
        apellido: item.persona.apellido,
        nombre: item.persona.nombre,
        dni: item.persona.dni,
        legajo: item.persona.legajo,
        secuencia: item.secuencia,
        tipoCargo: item.tipoCargo,
        vigente: item.vigente,
      }));
      setPersonas(personasData);
      setDataTableData(personasData); // <-- AÑADE ESTA LÍNEA
    } catch (error) {
      console.error("Error al realizar la petición POST:", error);
      alert("Hubo un error al enviar los datos.");
    } finally {
      setIsDataLoaded(true);
    }
  };

  const handleAgregar = async () => {
    if (!/^\d{8}$/.test(dni)) {
      setAlertMessage("El DNI debe tener exactamente 8 caracteres numéricos.");
      setAlertType("error");
      setAlertaDNI(true);
      setTimeout(() => {
        setAlertaDNI(false);
        setAlertMessage("");
        setAlertType("");
      }, 3000);
      return;
    }
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
        setIdPersona(data.item2.idPersona);
        setFormData({
          apellido: data.item2.apellido.toUpperCase(),
          nombre: data.item2.nombre.toUpperCase(),
          legajo: data.item2.legajo.toUpperCase(),
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

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === "apellido" || name === "nombre" ? value.toUpperCase() : value,
    }));
  };

  const handlePersonaSubmit = async () => {
    const requiredFields = ["nombre", "apellido", "dni", "legajo"];
    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      const missingFieldsNames = missingFields
        .map((field) => {
          switch (field) {
            case "nombre":
              return "Nombre";
            case "apellido":
              return "Apellido";
            case "dni":
              return "DNI";
            case "legajo":
              return "Legajo";
            default:
              return field;
          }
        })
        .join(", ");

      setAlertMessage(`Por favor, complete los siguientes campos: ${missingFieldsNames}`);
      setAlertType("error");
      setAlertPersona(true);
      setTimeout(() => {
        setAlertPersona(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);

      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}POF/POFPersona`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIdPersona(response.data.idPersona);
      setPofVisible(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(error.response.data.error);
      setAlertPersona(true);
      setTimeout(() => {
        setAlertPersona(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);
    }
  };
  const handlePofChange = (e) => {
    const { name, value } = e.target;
    setPofFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePofSubmit = async () => {
    const requiredFields = ["secuencia", "idCarRevista", "idFuncion", "tipoCargo", "idCategoria"];

    const missingFields = requiredFields.filter((field) => !pofFormData[field]);

    if (missingFields.length > 0) {
      const missingFieldsNames = missingFields
        .map((field) => {
          switch (field) {
            case "secuencia":
              return "Secuencia";
            case "idCarRevista":
              return "Car. Revista";
            case "idFuncion":
              return "Función";
            case "tipoCargo":
              return "Tipo Cargo";
            case "idCategoria":
              return "Categorías";
            default:
              return field;
          }
        })
        .join(", ");

      setAlertMessage(`Por favor, complete los siguientes campos: ${missingFieldsNames}`);
      setAlertType("error");
      setAlertPOF(true);
      setTimeout(() => {
        setAlertPOF(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);

      return;
    }
    if (pofFormData.secuencia.length > 3) {
      setAlertMessage("El campo 'Secuencia' no puede tener más de 3 caracteres.");
      setAlertType("error");
      setAlertPOF(true);

      setTimeout(() => {
        setAlertPOF(false);
        setAlertMessage("");
      }, 5000);

      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}POF/RegistrarPOF`,
        {
          ...pofFormData,
          idEstablecimiento: selectedEstablecimiento,
          idPersona,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlertMessage("Formulario enviado con éxito.");
      setAlertType("success");
      setAlertPOF(true);
      setTimeout(() => {
        setAlertPOF(false);
        setAlertMessage("");
        setPofFormData({
          secuencia: "",
          idCarRevista: "",
          idFuncion: "",
          tipoCargo: "",
          barra: "",
          idCategoria: "",
          vigente: "S",
        });
        setDni("");
        setFormData({
          apellido: "",
          nombre: "",
          legajo: "",
          dni: "",
        });
        setVerificarRespuesta(null);
        setPofVisible(false);
        handleCargar();
      }, 3000);
    } catch (error) {
      setAlertMessage("Ya existe el cargo en la POF.");
      setAlertType("error");
      setAlertPOF(true);
      setTimeout(() => {
        setAlertPOF(false);
        setAlertMessage("");
      }, 5000);
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
        const carRevistaVigentes = response.data.filter((carRevista) => carRevista.vigente === "S");
        setCarRevistaOptions(carRevistaVigentes);
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
        const funcionesVigentes = response.data.filter((funcion) => funcion.vigente === "S");
        setFunciones(funcionesVigentes);
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
        const categoriasVigentes = response.data.filter((categoria) => categoria.vigente === "S");
        setCategoriasOptions(categoriasVigentes);
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
  const handleEditSuccess = () => {
    setShowAlert(true);
    setAlertMessage("¡Datos actualizados con éxito!");
    setAlertType("success");
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage("");
    }, 3000);
    handleCargar();
  };
  const handleSuccessBarras = () => {
    setShowAlert(true);
    setAlertMessage("Se han actualizados las barras con éxito!");
    setAlertType("success");
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage("");
    }, 3000);
    handleCargar();
  };
  const handleEditar = (idPof) => {
    setSelectedIdPof(idPof);
    setIsModalOpen(true);
  };
  const handleBarras = (idPof) => {
    setSelectedIdPof(idPof);
    setIsModalBarrasOpen(true);
    console.log("Boton handleBarras");
  };
  const handleCancel = () => {
    setAlertPOF(false);
    setAlertMessage("");
    setPofFormData({
      secuencia: "",
      idCarRevista: "",
      idFuncion: "",
      tipoCargo: "",
      idCategoria: "",
      vigente: "S",
    });
    setDni("");
    setFormData({
      apellido: "",
      nombre: "",
      legajo: "",
      dni: "",
    });
    setVerificarRespuesta(null);
    setPofVisible(false);
    handleCargar();
  };

  const filteredData = personas.filter((persona) => {
    if (selectedFilter === "Todos") return true;
    return persona.vigente === selectedFilter;
  });

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox my={3}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="establecimiento-select-label">Establecimiento</InputLabel>
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
                      {establecimiento.nombrePcia}
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
        {showAlert && (
          <MDAlert color={alertType} dismissible>
            <MDTypography variant="body2" color="white">
              {alertMessage}
            </MDTypography>
          </MDAlert>
        )}
        {isDataLoaded ? (
          personas.length === 0 ? (
            <MDBox mt={3}>
              <MDBox sx={{ display: "flex" }}>
                <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
                <MDTypography variant="body2" mlci={1}>
                  No hay personas registradas en este establecimiento.
                </MDTypography>
              </MDBox>
              {alertaDNI && (
                <MDBox mt={3}>
                  <MDAlert color={alertType} dismissible onClose={() => setAlertaDNI(false)}>
                    <MDTypography variant="body2" color="white">
                      {alertMessage}
                    </MDTypography>
                  </MDAlert>
                </MDBox>
              )}
              <MDBox mt={2}>
                <Card>
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
            </MDBox>
          ) : (
            <>
              <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
                <FormControl style={{ width: "10rem" }} margin="normal">
                  <Select
                    labelId="vigente-filter-label"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    name="Vigente"
                    style={{ height: "2.5rem", backgroundColor: "white" }}
                  >
                    <MenuItem value="Todos">Todos</MenuItem>
                    <MenuItem value="S">Vigente</MenuItem>
                    <MenuItem value="N">No Vigente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Card>
                {dataTableData.length > 0 && (
                  <MDBox display="flex" justifyContent="flex-end" mt={2} mr={4}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      size="small"
                      onClick={handleDownloadExcel}
                    >
                      Descargar Excel
                    </MDButton>
                  </MDBox>
                )}
                <DataTable
                  table={{
                    columns: [
                      { Header: "Apellido", accessor: "apellido" },
                      { Header: "Nombre", accessor: "nombre" },
                      { Header: "DNI", accessor: "dni" },
                      { Header: "Legajo", accessor: "legajo" },
                      { Header: "Secuencia", accessor: "secuencia" },
                      { Header: "Tipo Cargo", accessor: "tipoCargo" },
                      {
                        Header: "Vigente",
                        accessor: (row) => (
                          <p>{row.vigente === "S" ? "SI" : row.vigente === "N" ? "NO" : "N/A"}</p>
                        ),
                      },
                      {
                        Header: "Acciones",
                        accessor: "edit",
                        Cell: ({ row }) => (
                          <>
                            <MDBox display="flex" gap={1}>
                              <MDButton
                                variant="gradient"
                                color="info"
                                size="small"
                                onClick={() => handleEditar(row.original.idPof)}
                              >
                                Editar
                              </MDButton>
                              <MDButton
                                variant="gradient"
                                color="success"
                                size="small"
                                onClick={() => handleBarras(row.original.idPof)}
                              >
                                Agregar Barras
                              </MDButton>
                            </MDBox>
                          </>
                        ),
                      },
                    ],
                    rows: filteredData,
                  }}
                  entriesPerPage={false}
                  canSearch
                />
                <EditarModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  idPof={selectedIdPof}
                  token={token}
                  onEditSuccess={handleEditSuccess}
                />
                <ModalBarras
                  isOpenBarras={isModalBarrasOpen}
                  onCloseBarras={() => setIsModalBarrasOpen(false)}
                  idPof={selectedIdPof}
                  token={token}
                  onEditSuccess={handleSuccessBarras}
                />
              </Card>
              {alertaDNI && (
                <MDBox mt={3}>
                  <MDAlert color={alertType} dismissible onClose={() => setAlertaDNI(false)}>
                    <MDTypography variant="body2" color="white">
                      {alertMessage}
                    </MDTypography>
                  </MDAlert>
                </MDBox>
              )}
              <MDBox mt={2}>
                <Card>
                  <MDBox component="form" m={2}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormField
                          label="DNI"
                          name="Dni"
                          type="number"
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
            </>
          )
        ) : (
          <MDTypography variant="body2" m={1}>
            Seleccione un establecimiento y haga clic en Cargar para mostrar datos.
          </MDTypography>
        )}
        {verificarRespuesta !== null && (
          <MDBox mt={2}>
            <MDAlert className="custom-alert">
              <Icon sx={{ color: "#4b6693" }}>info_outlined</Icon>
              <MDTypography ml={1} variant="button">
                Datos Persona
              </MDTypography>
            </MDAlert>
            {alertPersona && (
              <MDBox mt={3}>
                <MDAlert color={alertType} dismissible onClose={() => setAlertPersona(false)}>
                  <MDTypography variant="body2" color="white">
                    {alertMessage}
                  </MDTypography>
                </MDAlert>
              </MDBox>
            )}
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
                    <FormField label="DNI" name="dni" type="number" value={formData.dni} disabled />
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
            {alertPOF && (
              <MDBox mt={3}>
                <MDAlert color={alertType} dismissible onClose={() => setAlertPOF(false)}>
                  <MDTypography variant="body2" color="white">
                    {alertMessage}
                  </MDTypography>
                </MDAlert>
              </MDBox>
            )}
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
                      type="number"
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
                        name="idCarRevista"
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
                        name="idCategoria"
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
                        name="idFuncion"
                        label="funcion"
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
                        label="tipoCargo"
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
                <MDBox mt={2} sx={{ display: "flex" }}>
                  <MDBox mr={2}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      size="small"
                      onClick={handlePofSubmit}
                    >
                      Enviar POF
                    </MDButton>
                  </MDBox>
                  <MDBox>
                    <MDButton variant="gradient" color="light" size="small" onClick={handleCancel}>
                      Cancelar
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </MDBox>
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
