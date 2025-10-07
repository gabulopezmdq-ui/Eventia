import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
} from "@mui/material";
import DataTable from "examples/Tables/DataTable";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import DetallePopup from "./DetallePopUp";
import AgregarDetalle from "./AgregarDetalle";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import jwt_decode from "jwt-decode";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function AltaCabeceraMovimientos() {
  const { id } = useParams();
  const [establecimientos, setEstablecimientos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [mostrarFormularioDetalle, setMostrarFormularioDetalle] = useState(false);
  const [idCabecera, setIdCabecera] = useState(null);
  const [ruralidadCabecera, setRuralidadCabecera] = useState("");
  const [idEstablecimiento, setIdEstablecimiento] = useState("");
  const [detallesCargados, setDetallesCargados] = useState(false);
  const [cabeceraCamposBloqueados, setCabeceraCamposBloqueados] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [cabeceras, setCabeceras] = useState([]);
  const [cabeceraSeleccionada, setCabeceraSeleccionada] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [alertDetalle, setAlertDetalle] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");

  const [formData, setFormData] = useState({
    area: "",
    mes: "",
    anio: "",
    //anio: new Date().getFullYear().toString(),
    idEstablecimiento: "",
    Accion: [],
    estado: "P",
    observaciones: "", // 👈 Nuevo campo
  });
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [formDeshabilitado, setFormDeshabilitado] = useState(false);
  const token = sessionStorage.getItem("token");
  const decodedToken = token ? jwt_decode(token) : {};
  const userRol = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const userIdEstablecimiento = decodedToken["idEstablecimiento"];
  const roles = Array.isArray(userRol) ? userRol : [userRol];
  const navigate = useNavigate();

  const areaOptions = [
    { label: "LIQUIDACIONES", value: "L" },
    { label: "LICENCIAS POR ENFERMEDAD", value: "E" },
    { label: "ASIGNACIONES FAMILIARES", value: "A" },
    { label: "COORDINACION ADMINISTRATIVA", value: "C" },
    { label: "LICENCIAS EXTRAODINARIAS Y CRÓNICAS", value: "O" },
  ];

  const meses = [
    { label: "Enero", value: 1 },
    { label: "Febrero", value: 2 },
    { label: "Marzo", value: 3 },
    { label: "Abril", value: 4 },
    { label: "Mayo", value: 5 },
    { label: "Junio", value: 6 },
    { label: "Julio", value: 7 },
    { label: "Agosto", value: 8 },
    { label: "Septiembre", value: 9 },
    { label: "Octubre", value: 10 },
    { label: "Noviembre", value: 11 },
    { label: "Diciembre", value: 12 },
  ];

  const acciones = [
    { label: "Altas", value: "A" },
    { label: "Bajas", value: "B" },
    { label: "Modificaciones", value: "M" },
    { label: "Adicionales", value: "D" },
  ];

  const estados = [
    { label: "Pendiente", value: "P" },
    { label: "Enviado a Educación", value: "E" },
    { label: "Enviado a Provincia", value: "V" },
    { label: "Rechazado", value: "R" }, // 👈 agrega R
  ];
  useEffect(() => {
    const fetchCabeceras = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + "MovimientosCabecera/GetAll", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = res.data;

        // Obtener valores actuales dentro del efecto
        const currentRoles = Array.isArray(userRol) ? userRol : [userRol];
        const currentUserIdEst = userIdEstablecimiento;

        if (!currentRoles.includes("SuperAdmin")) {
          const ids = Array.isArray(currentUserIdEst)
            ? currentUserIdEst.map(String)
            : [String(currentUserIdEst)];

          data = data.filter((c) => ids.includes(String(c.idEstablecimiento)));
        }

        setCabeceras(data);
        console.log("cabeceras cargadas: ", data);
      } catch (err) {
        console.error("Error al cargar cabeceras", err);
      }
    };

    if (!id) fetchCabeceras();
  }, [id, token]);

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const res = await axios.get(process.env.REACT_APP_API_URL + "Establecimientos/GetAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEstablecimientos(res.data);
      } catch (err) {
        console.error("Error al cargar establecimientos", err);
      }
    };

    fetchEstablecimientos();

    if (id) {
      const fetchCabecera = async () => {
        try {
          const res = await axios.get(
            process.env.REACT_APP_API_URL + `MovimientosCabecera/GetByIdCabecera?Id=${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const cabecera = res.data;
          const accionesSeleccionadas = [];
          if (cabecera.altas === "A") accionesSeleccionadas.push("A");
          if (cabecera.bajas === "B") accionesSeleccionadas.push("B");
          if (cabecera.modificaciones === "M") accionesSeleccionadas.push("M");
          if (cabecera.adicionales === "D") accionesSeleccionadas.push("D");

          setFormData({
            area: cabecera.area,
            mes: cabecera.mes,
            anio: cabecera.anio,
            idEstablecimiento: cabecera.idEstablecimiento,
            Accion: accionesSeleccionadas,
            estado: cabecera.estado,
            observaciones: cabecera.observaciones || "", // 👈 agrega esto
          });
          setIdCabecera(cabecera.idMovimientoCabecera);
          setFormDeshabilitado(true);
          setCabeceraCamposBloqueados(true);
          setMostrarDetalle(true);
          if (cabecera.establecimientos?.ruralidad) {
            setRuralidadCabecera(cabecera.establecimientos.ruralidad);
          }
          setIdEstablecimiento(cabecera.idEstablecimiento);
          fetchDetalles(cabecera.idMovimientoCabecera);
        } catch (err) {
          console.error("Error al cargar cabecera", err);
          alert("Error al cargar los datos de la cabecera");
        }
      };
      fetchCabecera();
    }
  }, [id, token]);
  const fetchCategorias = async () => {
    try {
      const res = await axios.get(process.env.REACT_APP_API_URL + "tiposcategorias/getall", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategorias(res.data);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    }
  };

  const fetchDetalles = async (cabeceraId) => {
    try {
      const res = await axios.get(
        process.env.REACT_APP_API_URL +
          `MovimientosCabecera/DetallesCabecera?IdCabecera=${cabeceraId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const detallesConCategoria = res.data.map((detalle) => {
        console.log("detalle: ", detalle);
        const categoria = categorias.find((c) => c.idTipoCategoria === detalle.idTipoCategoria);
        return {
          ...detalle,
          idTipoCategoria: categoria ? categoria.descripcion : "Sin categoría",
        };
      });

      setDetalles(detallesConCategoria);
      setDetallesCargados(true);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("Entre al error 404 - No hay detalles cargados aún");
        setDetalles([]);
        setMostrarDetalle(true);
        setIdCabecera(cabeceraId);
      } else {
        console.error("Error al cargar detalles", err);
      }
    }
  };
  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (categorias.length > 0 && idCabecera) {
      fetchDetalles(idCabecera);
    }
  }, [categorias, idCabecera]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      Accion: checked ? [...prev.Accion, value] : prev.Accion.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async () => {
    const { Accion, ...resto } = formData;

    const payload = {
      ...resto,
      idSuperCabecera: cabeceraSeleccionada || null,
      altas: Accion.includes("A") ? "A" : null,
      bajas: Accion.includes("B") ? "B" : null,
      modificaciones: Accion.includes("M") ? "M" : null,
      adicionales: Accion.includes("D") ? "D" : null,
    };

    try {
      const response = await axios.post(
        process.env.REACT_APP_API_URL + "MovimientosCabecera/AddMovCabecera",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data === false || response.data?.success === false) {
        setAlertMessage(
          "Ya existe un registro con esa combinación IdEstablecimiento - Mes - Año - Área"
        );
        setAlertType("error");
        setAlertDetalle(true);
        setTimeout(() => {
          setAlertDetalle(false);
          setAlertMessage("");
          setAlertType("");
          navigate(-1);
        }, 5000);
        return;
      }

      if (response.data && response.data.idMovimientoCabecera) {
        setIdCabecera(response.data.idMovimientoCabecera);
        fetchDetalles(response.data.idMovimientoCabecera);
        setIdEstablecimiento(formData.idEstablecimiento);
        setDetallesCargados(false);
      }

      setAlertMessage("Alta exitosa de la Cabecera ✅");
      setAlertType("success");
      setAlertDetalle(true);
      setTimeout(() => {
        setAlertDetalle(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);

      setFormDeshabilitado(true);
      setMostrarDetalle(true);
    } catch (err) {
      if (err.response) {
        const backendError = err.response.data?.error;
        if (backendError) {
          setAlertMessage(backendError);
          setAlertType("error");
        } else if (err.response.status === 404) {
          setAlertMessage(
            "Ya existe un registro con esa combinación IdEstablecimiento - Mes - Año - Área"
          );
          setAlertType("error");
        } else {
          console.error("Error al guardar", err.response);
          setAlertMessage("Error en el servidor");
          setAlertType("error");
        }
      } else {
        console.error("Error al guardar", err);
        setAlertMessage("Error al guardar");
        setAlertType("error");
      }

      setAlertDetalle(true);
      setTimeout(() => {
        setAlertDetalle(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);
    }
  };
  const handleDetalleSubmit = async (detalleData) => {
    try {
      const payload = {
        ...detalleData,
        idMovimientoCabecera: idCabecera,
      };
      const url =
        detalleData.tipoMovimiento === "B"
          ? process.env.REACT_APP_API_URL + "MovimientosCabecera/MovimientosBajas"
          : process.env.REACT_APP_API_URL + "MovimientosCabecera/AddDetalle";

      const response = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setAlertMessage("Detalle guardado correctamente");
        setAlertType("success");
        setAlertDetalle(true);
        setTimeout(() => {
          setAlertDetalle(false);
          setAlertMessage("");
          setAlertType("");
        }, 5000);
        fetchDetalles(idCabecera);
        setMostrarFormularioDetalle(false);
      }
    } catch (error) {
      console.error("Error al guardar el detalle:", error);
      setAlertMessage("Error al guardar el detalle");
      setAlertType("error");
      setAlertDetalle(true);
      setTimeout(() => {
        setAlertDetalle(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);
    }
  };

  const handleVer = (detalle) => {
    setDetalleSeleccionado(detalle);
    setOpenPopup(true);
  };

  const handleCerrarPopup = () => {
    setOpenPopup(false);
    setDetalleSeleccionado(null);
  };

  const handleEliminar = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}MovimientosCabecera/EliminarDetalle`, {
        params: { IdMovimientoDetalle: id },
      });

      await fetchDetalles(idCabecera);

      setAlertMessage(`Detalle con id ${id} eliminado correctamente`);
      setAlertType("success");
      setAlertDetalle(true);
      setTimeout(() => {
        setAlertDetalle(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);
    } catch (error) {
      console.error("Error al eliminar:", error);

      setAlertMessage("No se pudo eliminar el detalle. Intente nuevamente.");
      setAlertType("error");
      setAlertDetalle(true);
      setTimeout(() => {
        setAlertDetalle(false);
        setAlertMessage("");
        setAlertType("");
      }, 5000);
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox component="form" pb={3} px={3}>
        <Card>
          <Grid container spacing={3} p={2}>
            {!id && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Seleccionar Cabecera</InputLabel>
                  <Select
                    label="Seleccionar Cabecera"
                    value={cabeceraSeleccionada || ""}
                    onChange={(e) => {
                      const cabeceraId = e.target.value;
                      setCabeceraSeleccionada(cabeceraId);
                      console.log("cabeceraSeleccionada: ", cabeceraSeleccionada);
                      const cabecera = cabeceras.find(
                        (c) => String(c.idSuperCabecera) === String(cabeceraId)
                      );

                      if (cabecera) {
                        setFormData({
                          area: cabecera.area,
                          mes: cabecera.mes,
                          anio: cabecera.anio,
                          idEstablecimiento: cabecera.idEstablecimiento,
                          Accion: [],
                          estado: "P",
                        });
                        setIdEstablecimiento(cabecera.idEstablecimiento);
                        setCabeceraCamposBloqueados(true);
                        setFormDeshabilitado(false);
                      }
                    }}
                    style={{ height: "2.8rem", backgroundColor: "white" }}
                  >
                    {cabeceras.map((c) => (
                      <MenuItem key={c.idSuperCabecera} value={c.idSuperCabecera}>
                        {`${c.area} - ${c.mes}/${c.anio} - ${c.establecimiento?.nombrePcia}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={formDeshabilitado || cabeceraCamposBloqueados}>
                <InputLabel>Área</InputLabel>
                <Select
                  name="area"
                  label="Área"
                  value={formData.area}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {areaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={formDeshabilitado || cabeceraCamposBloqueados}>
                <InputLabel>Mes</InputLabel>
                <Select
                  name="mes"
                  label="Mes"
                  value={formData.mes}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {meses.map((mes) => (
                    <MenuItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="anio"
                type="number"
                disabled={formDeshabilitado || cabeceraCamposBloqueados}
                value={formData.anio}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={formDeshabilitado || cabeceraCamposBloqueados}>
                <InputLabel>Establecimiento</InputLabel>
                <Select
                  name="idEstablecimiento"
                  label="Establecimiento"
                  value={formData.idEstablecimiento}
                  onChange={handleInputChange}
                  style={{ height: "2.8rem", backgroundColor: "white" }}
                >
                  {roles.includes("Secretario")
                    ? establecimientos
                        .filter((e) => e.idEstablecimiento.toString() === userIdEstablecimiento)
                        .map((e) => (
                          <MenuItem key={e.idEstablecimiento} value={e.idEstablecimiento}>
                            {e.nombrePcia.trim().replace(/"/g, "\\ ")}
                          </MenuItem>
                        ))
                    : establecimientos.map((e) => (
                        <MenuItem key={e.idEstablecimiento} value={e.idEstablecimiento}>
                          {e.nombrePcia.trim().replace(/"/g, "\\ ")}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormGroup row>
                {acciones.map((accion) => (
                  <FormControlLabel
                    key={accion.value}
                    control={
                      <Checkbox
                        value={accion.value}
                        disabled={formDeshabilitado}
                        checked={formData.Accion.includes(accion.value)}
                        onChange={handleCheckboxChange}
                      />
                    }
                    label={accion.label}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  label="Estado"
                  value={formData.estado}
                  style={{ height: "2.8rem" }}
                  disabled
                >
                  {estados.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="MOTIVO DE DEVOLUCIÓN"
                value={formData.observaciones || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          {!id && !formDeshabilitado && (
            <MDBox mt={3} p={2} display="flex" justifyContent="flex-end">
              <MDButton
                variant="contained"
                color="info"
                size="small"
                onClick={handleSubmit}
                disabled={
                  (!cabeceraSeleccionada && id) || // si estoy editando pero no elegí cabecera
                  !formData.idEstablecimiento ||
                  !formData.mes ||
                  !formData.anio ||
                  formData.Accion.length === 0
                }
              >
                Guardar
              </MDButton>
            </MDBox>
          )}
        </Card>
        {mostrarDetalle && idCabecera && (
          <>
            <MDBox mt={2} px={3} display="flex" justifyContent="flex-end">
              <MDButton
                variant="contained"
                color="success"
                size="small"
                onClick={() => setMostrarFormularioDetalle(true)}
              >
                Nuevo Detalle
              </MDButton>
            </MDBox>

            {mostrarFormularioDetalle && (
              <MDBox mt={3} px={3}>
                <AgregarDetalle
                  idCabecera={idCabecera}
                  idEstablecimiento={idEstablecimiento}
                  accionesDisponibles={formData.Accion}
                  ruralidad={ruralidadCabecera}
                  onSubmit={(data) => {
                    handleDetalleSubmit(data);
                    setMostrarFormularioDetalle(false);
                  }}
                  onCancel={() => setMostrarFormularioDetalle(false)}
                />
              </MDBox>
            )}
          </>
        )}
        {alertDetalle && (
          <MDBox mt={3}>
            <MDAlert color={alertType} dismissibleonClose={() => setAlertDetalle(false)}>
              <MDTypography variant="body2" color="white">
                {alertMessage}
              </MDTypography>
            </MDAlert>
          </MDBox>
        )}
        {detalles.length > 0 && (
          <>
            <MDBox mt={3}>
              <Card>
                <DataTable
                  table={{
                    columns: [
                      { Header: "DNI", accessor: "numDoc" },
                      { Header: "T Doc", accessor: "tipoDoc" },
                      { Header: "Apellido", accessor: "apellido" },
                      { Header: "Nombre", accessor: "nombre" },
                      { Header: "SitRev", accessor: "sitRevista" },
                      { Header: "Función", accessor: "idTipoFuncion" },
                      { Header: "Rural", accessor: "rural" },
                      { Header: "Turno", accessor: "turno" },
                      { Header: "Cat", accessor: "idTipoCategoria" },
                      { Header: "Hs", accessor: "horas" },
                      { Header: "Años", accessor: "antigAnios" },
                      { Header: "Meses", accessor: "antigMeses" },
                      {
                        Header: "Acciones",
                        accessor: "acciones",
                        Cell: ({ row }) => (
                          <MDBox display="flex" gap={1}>
                            <MDButton
                              variant="gradient"
                              color="info"
                              size="small"
                              onClick={() => handleVer(row.original)}
                            >
                              Ver
                            </MDButton>
                            <MDButton
                              variant="gradient"
                              color="error"
                              size="small"
                              onClick={() => handleEliminar(row.original.idMovimientoDetalle)}
                            >
                              Eliminar
                            </MDButton>
                          </MDBox>
                        ),
                      },
                    ],
                    rows: detalles,
                  }}
                  entriesPerPage={false}
                  canSearch
                  showTotalEntries={false}
                />
              </Card>
            </MDBox>
          </>
        )}
      </MDBox>
      <DetallePopup open={openPopup} onClose={handleCerrarPopup} detalle={detalleSeleccionado} />
    </DashboardLayout>
  );
}
AltaCabeceraMovimientos.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};
export default AltaCabeceraMovimientos;
