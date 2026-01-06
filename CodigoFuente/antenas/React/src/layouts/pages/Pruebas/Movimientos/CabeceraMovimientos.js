import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import jwt_decode from "jwt-decode";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import GeneradorPDF from "./GeneradorPDF";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { BajasModificacionesPDF } from "./BajasModificacionesPDF";
import "../../Pruebas/pruebas.css";
// Dashboard components
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import Autocomplete from "@mui/material/Autocomplete";
import Icon from "@mui/material/Icon";

function CabeceraMovimientos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [openDevolver, setOpenDevolver] = useState(false);
  const [devolucionObs, setDevolucionObs] = useState("");
  const [devolverCabeceraId, setDevolverCabeceraId] = useState(null);

  // Dashboard
  const [allData, setAllData] = useState([]);
  const [filterEstado, setFilterEstado] = useState(null);
  const [filterEstablecimiento, setFilterEstablecimiento] = useState(null);
  const [counts, setCounts] = useState({
    pendientes: 0,
    enviadosEducacion: 0,
    enviadosProvincia: 0,
    rechazados: 0,
  });
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchConceptos();
  }, []);

  const fetchConceptos = async () => {
    try {
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.id;

      const rolesKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      const userRolesFromToken = decodedToken[rolesKey] || [];

      setUserRoles(userRolesFromToken);
      let data = [];
      if (userRolesFromToken.includes("SuperAdmin")) {
        const movimientosResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}MovimientosCabecera/GetAllCabeceras`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        data = movimientosResponse.data;
      } else {
        const rolesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}MovimientosCabecera/RolesEst?id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("RolesEst recibido:", rolesResponse.data);

        const { idsEstablecimientos, roles } = rolesResponse.data;
        setUserRoles(roles);
        const movimientosResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}MovimientosCabecera/GetAllCabeceras`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        data = movimientosResponse.data.filter((movimiento) =>
          idsEstablecimientos.includes(movimiento.idEstablecimiento)
        );
      }

      setAllData(data);
      setDataTableData(data);
      calculateCounts(data);
    } catch (error) {
      console.error(error);
      if (error.response) {
        const statusCode = error.response.status;
        let errorMessage = "";
        let errorType = "error";
        if (statusCode >= 400 && statusCode < 500) {
          errorMessage = `Error ${statusCode}: Hubo un problema con la solicitud del cliente.`;
        } else if (statusCode >= 500) {
          errorMessage = `Error ${statusCode}: Hubo un problema en el servidor.`;
        }
        setErrorAlert({ show: true, message: errorMessage, type: errorType });
      } else {
        setErrorAlert({
          show: true,
          message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
          type: "error",
        });
      }
    }
  };

  const calculateCounts = (data) => {
    const newCounts = {
      pendientes: 0,
      enviadosEducacion: 0,
      enviadosProvincia: 0,
      rechazados: 0,
    };

    data.forEach((item) => {
      const estado = String(item.estado ?? "")
        .trim()
        .toUpperCase();
      if (estado === "P") newCounts.pendientes++;
      else if (estado === "E") newCounts.enviadosEducacion++;
      else if (estado === "V") newCounts.enviadosProvincia++;
      else if (estado === "R" || estado === "RECHAZADO") newCounts.rechazados++;
    });
    setCounts(newCounts);
  };

  useEffect(() => {
    let dataForCounts = [...allData];
    if (filterEstablecimiento) {
      dataForCounts = dataForCounts.filter(
        (item) => item.establecimientos?.nroEstablecimiento === filterEstablecimiento.label
      );
    }
    calculateCounts(dataForCounts);
    let dataForTable = [...dataForCounts];
    if (filterEstado) {
      dataForTable = dataForTable.filter((item) => {
        const estado = String(item.estado ?? "")
          .trim()
          .toUpperCase();
        return estado === filterEstado.value;
      });
    }
    setDataTableData(dataForTable);
  }, [filterEstado, filterEstablecimiento, allData]);
  const establishmentOptions = [
    ...new Set(allData.map((item) => item.establecimientos?.nroEstablecimiento)),
  ]
    .filter(Boolean)
    .sort()
    .map((nro) => ({ label: nro, id: nro }));

  const handleCardClick = (estado) => {
    if (filterEstado && filterEstado.value === estado.value) {
      setFilterEstado(null);
    } else {
      setFilterEstado(estado);
    }
  };
  const stateOptions = [
    { label: "Pendiente", value: "P" },
    { label: "Enviado a Educación", value: "E" },
    { label: "Enviado a Provincia", value: "V" },
    { label: "Rechazado", value: "R" },
  ];

  const handleNuevoMovimiento = () => {
    navigate("/CabeceraMovimientos/Nuevo");
  };

  const areaOptions = [
    { label: "LIQUIDACIONES", value: "L" },
    { label: "LICENCIAS POR ENFERMEDAD", value: "E" },
    { label: "ASIGNACIONES FAMILIARES", value: "A" },
    { label: "COORDINACION ADMINISTRATIVA", value: "C" },
  ];

  const handleImprimir = async (movimiento) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}MovimientosCabecera/Reporte?idcabecera=${movimiento.idMovimientoCabecera}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      const areaLabel = areaOptions.find((opt) => opt.value === data.area)?.label || data.area;

      const movimientoConTodo = {
        establecimiento: data.nombrePcia,
        diegep: data.nroDiegep,
        tipoEstablecimiento: data.idTipoEstablecimiento,
        nroEstablecimiento: data.nroEstablecimiento,
        subvencion: data.subvencion,
        mes: convertirMes(data.mes),
        anio: data.anio,
        area: areaLabel,
        docentes: data.docentes.map((docente) => {
          const esBaja = docente.tipoMovimiento === "B";

          return {
            nDNI: docente.numDoc,
            nombre: docente.nombre,
            apellido: docente.apellido,
            turno: esBaja ? "" : docente.turno,
            nHoras: esBaja ? "" : docente.horas?.toString() || "",
            anos: esBaja ? "" : docente.antigAnios?.toString() || "",
            meses: esBaja ? "" : docente.antigMeses?.toString() || "",
            sitRevista: docente.sitRevista,
            secuencia: docente.secuencia != null ? docente.secuencia : "",
            observaciones: docente.observaciones || "",
            tipoMovimiento: docente.tipoMovimiento,
            tipoDoc: docente.tipoDoc,
            categoria: esBaja ? "" : docente.categoria?.toString() || "",
            funcion: esBaja ? "" : docente.funcion?.toString() || "",
            ruralidad: esBaja ? "" : data.ruralidad?.toString() || "",
          };
        }),
      };

      await GeneradorPDF.generar(movimientoConTodo);
    } catch (error) {
      console.error(error);

      let errorBack;

      if (typeof error?.response?.data === "string") {
        errorBack = error.response.data;
      } else if (error?.response?.data?.message) {
        errorBack = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorBack = error.response.data.error;
      } else {
        errorBack = "Ocurrió un error al obtener los datos para imprimir.";
      }

      setErrorAlert({
        show: true,
        message: errorBack,
        type: "error",
      });

      setTimeout(() => {
        setErrorAlert({ show: false, message: "", type: "error" });
      }, 3000);
    }
  };
  const convertirMes = (mesNumerico) => {
    const meses = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];
    return meses[mesNumerico - 1] || mesNumerico.toString();
  };
  const handleEnviarEducacion = (movimiento) => {
    const confirmacion = window.confirm(
      `¿Está seguro de enviar el movimiento ${movimiento.mes}/${movimiento.anio} ${movimiento.establecimientos.nroEstablecimiento} a Educación?`
    );
    if (!confirmacion) {
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_API_URL}MovimientosCabecera/EnviarEduc`,
        {
          idMovimientoCabecera: movimiento.idMovimientoCabecera,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        fetchConceptos();
        setErrorAlert({
          show: true,
          message: "Movimiento enviado a Educación correctamente.",
          type: "success",
        });
      })
      .catch((error) => {
        if (error.response) {
          const statusCode = error.response.status;
          let errorMessage = "";
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Problema en la solicitud.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Problema en el servidor.`;
          }
          setErrorAlert({ show: true, message: errorMessage, type: "error" });
        } else {
          setErrorAlert({
            show: true,
            message: "Ocurrió un error inesperado al enviar a Educación.",
            type: "error",
          });
        }
      });
  };
  const handleEnviarProvincia = (movimiento) => {
    console.log("muestro movimeinto: ", movimiento);
    const confirmacion = window.confirm(
      `¿Está seguro de enviar el movimiento ${movimiento.mes}/${movimiento.anio} ${movimiento.establecimientos.nroEstablecimiento} a Provincia?`
    );
    if (!confirmacion) {
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_API_URL}MovimientosCabecera/EnviarProv`,
        {
          idMovimientoCabecera: movimiento.idMovimientoCabecera,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        fetchConceptos();
        setErrorAlert({
          show: true,
          message: "Movimiento enviado a Provincia correctamente.",
          type: "success",
        });
      })
      .catch((error) => {
        if (error.response) {
          const statusCode = error.response.status;
          let errorMessage = "";
          if (statusCode >= 400 && statusCode < 500) {
            errorMessage = `Error ${statusCode}: Problema en la solicitud.`;
          } else if (statusCode >= 500) {
            errorMessage = `Error ${statusCode}: Problema en el servidor.`;
          }
          setErrorAlert({ show: true, message: errorMessage, type: "error" });
        } else {
          setErrorAlert({
            show: true,
            message: "Ocurrió un error inesperado al enviar a Educación.",
            type: "error",
          });
        }
      });
  };
  const handleAbrirModalDevolver = (movimiento) => {
    setDevolverCabeceraId(movimiento.idMovimientoCabecera);
    setDevolucionObs(movimiento.observaciones || "");
    setOpenDevolver(true);
  };

  const handleCerrarModalDevolver = () => {
    setOpenDevolver(false);
    setDevolucionObs("");
    setDevolverCabeceraId(null);
  };

  const handleGuardarDevolucion = async () => {
    if (!devolverCabeceraId) return;
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}MovimientosCabecera/DevolverMov`,
        {
          idCabecera: devolverCabeceraId,
          observaciones: devolucionObs,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresca y espera
      await fetchConceptos();
      setErrorAlert({
        show: true,
        message: "Movimiento devuelto (rechazado) correctamente.",
        type: "success",
      });

      // Cerramos modal y limpiamos
      handleCerrarModalDevolver();
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage =
          statusCode >= 500
            ? `Error ${statusCode}: Problema en el servidor.`
            : `Error ${statusCode}: Problema en la solicitud.`;
        setErrorAlert({ show: true, message: errorMessage, type: "error" });
      } else {
        setErrorAlert({
          show: true,
          message: "Ocurrió un error inesperado al devolver el movimiento.",
          type: "error",
        });
      }
    }
  };

  const handleDescargarCambios = async (row) => {
    console.log("row: ", row);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}MovimientosCabecera/DetallesPDF?idCabecera=${row.idMovimientoCabecera}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.detalles;
      const user = response.data;
      const filteredData = data.filter(
        (item) => item.tipoMovimiento === "M" || item.tipoMovimiento === "B"
      );
      const usuario = {
        nombrePersona: user.nombrePersona,
        apellidoPersona: user.apellidoPersona,
      };
      await BajasModificacionesPDF({
        title: "Informacion para Bajas",
        data: filteredData,
        infoTitulos: row,
        usuario: usuario,
        fileName: `InformacionBajas${row.idMovimientoCabecera}`,
      });
    } catch (error) {
      console.error("Error al generar PDF", error);
    }
  };
  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox mt={1.5} mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} sx={{ position: "relative" }}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="schedule"
                  title="Pendientes"
                  count={counts.pendientes}
                  percentage={{
                    color: "success",
                    amount: "",
                  }}
                />
                <MDButton
                  variant="text"
                  color="dark"
                  size="small"
                  onClick={() => handleCardClick({ label: "Pendiente", value: "P" })}
                  sx={{ position: "absolute", bottom: 8, right: 8 }}
                >
                  Ver
                </MDButton>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} sx={{ position: "relative" }}>
                <ComplexStatisticsCard
                  color="info"
                  icon="school"
                  title="Enviados a Educación"
                  count={counts.enviadosEducacion}
                  percentage={{
                    color: "success",
                    amount: "",
                  }}
                />
                <MDButton
                  variant="text"
                  color="dark"
                  size="small"
                  onClick={() => handleCardClick({ label: "Enviado a Educación", value: "E" })}
                  sx={{ position: "absolute", bottom: 8, right: 8 }}
                >
                  Ver
                </MDButton>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} sx={{ position: "relative" }}>
                <ComplexStatisticsCard
                  color="success"
                  icon="account_balance"
                  title="Provincia"
                  count={counts.enviadosProvincia}
                  percentage={{
                    color: "success",
                    amount: "",
                  }}
                />
                <MDButton
                  variant="text"
                  color="dark"
                  size="small"
                  onClick={() => handleCardClick({ label: "Enviado a Provincia", value: "V" })}
                  sx={{ position: "absolute", bottom: 8, right: 8 }}
                >
                  Ver
                </MDButton>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5} sx={{ position: "relative" }}>
                <ComplexStatisticsCard
                  color="error"
                  icon="error"
                  title="Rechazados"
                  count={counts.rechazados}
                  percentage={{
                    color: "success",
                    amount: "",
                  }}
                />
                <MDButton
                  variant="text"
                  color="dark"
                  size="small"
                  onClick={() => handleCardClick({ label: "Rechazado", value: "R" })}
                  sx={{ position: "absolute", bottom: 8, right: 8 }}
                >
                  Ver
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12}>
                  <Autocomplete
                    options={establishmentOptions}
                    getOptionLabel={(option) => String(option.label)}
                    value={filterEstablecimiento}
                    onChange={(event, newValue) => {
                      setFilterEstablecimiento(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Filtrar por Establecimiento"
                        variant="standard"
                      />
                    )}
                  />
                </Grid>
                {filterEstado && (
                  <Grid item xs={12} display="flex" justifyContent="flex-end">
                    <MDButton
                      variant="gradient"
                      color="primary"
                      size="small"
                      onClick={() => setFilterEstado(null)}
                    >
                      Quitar Filtro ({filterEstado.label})
                    </MDButton>
                  </Grid>
                )}
              </Grid>
            </MDBox>
          </Card>
        </MDBox>

        <MDBox display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <MDButton variant="gradient" size="small" color="success" onClick={handleNuevoMovimiento}>
            Agregar
          </MDButton>
        </MDBox>
        {errorAlert.show && (
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={12}>
              <MDBox pt={2}>
                <MDAlert color={errorAlert.type} dismissible>
                  <MDTypography variant="body2" color="white">
                    {errorAlert.message}
                  </MDTypography>
                </MDAlert>
              </MDBox>
            </Grid>
          </Grid>
        )}
        {dataTableData.length === 0 ? (
          <MDBox my={3}>
            <MDBox p={3} textAlign="center">
              No tiene cabeceras de movimientos asociadas.
            </MDBox>
          </MDBox>
        ) : (
          <MDBox my={3}>
            <Card>
              <DataTable
                table={{
                  columns: [
                    { Header: "Area", accessor: "area", Cell: ({ value }) => value ?? "" },
                    { Header: "Año", accessor: "anio", Cell: ({ value }) => value ?? "" },
                    { Header: "Mes", accessor: "mes", Cell: ({ value }) => value ?? "" },
                    { Header: "Establecimiento", accessor: "establecimientos.nroEstablecimiento" },
                    {
                      Header: "Apellidos",
                      accessor: "apellidos",
                      Cell: ({ value }) => value ?? "",
                    },
                    {
                      Header: "Estado",
                      accessor: "estado",
                      Cell: ({ value }) => {
                        const estados = [
                          { label: "Pendiente", value: "P" },
                          { label: "Enviado a Educación", value: "E" },
                          { label: "Enviado a Provincia", value: "V" },
                          { label: "Rechazado", value: "R" },
                        ];
                        const encontrado = estados.find((e) => e.value === value);
                        return encontrado ? encontrado.label : value ?? "";
                      },
                    },
                    {
                      Header: "Acciones",
                      accessor: "acciones",
                      Cell: ({ row }) => {
                        const estadoNorm = String(row?.original?.estado ?? "")
                          .trim()
                          .toUpperCase();
                        const isRechazado = estadoNorm === "R" || estadoNorm === "RECHAZADO";

                        return (
                          <MDBox display="flex" gap={1}>
                            {((estadoNorm === "P" &&
                              (userRoles.includes("Secretario") ||
                                userRoles.includes("Admin") ||
                                userRoles.includes("SuperAdmin"))) ||
                              (estadoNorm === "E" &&
                                (userRoles.includes("Admin") ||
                                  userRoles.includes("SuperAdmin"))) ||
                              (estadoNorm === "R" &&
                                (userRoles.includes("Admin") ||
                                  userRoles.includes("SuperAdmin") ||
                                  userRoles.includes("Secretario")))) && (
                              <MDButton
                                variant="gradient"
                                color="warning"
                                size="small"
                                onClick={() =>
                                  navigate(
                                    `/CabeceraMovimientos/Edit/${row.original.idMovimientoCabecera}`
                                  )
                                }
                              >
                                Editar
                              </MDButton>
                            )}
                            <MDButton
                              variant="gradient"
                              size="small"
                              color="info"
                              onClick={() => handleImprimir(row.original)}
                            >
                              Reporte
                            </MDButton>

                            {/* Enviar a Educación (habilitado en P o R) */}
                            {(estadoNorm === "P" || estadoNorm === "R") && (
                              <MDButton
                                variant="gradient"
                                size="small"
                                color="secondary"
                                onClick={() => handleEnviarEducacion(row.original)}
                              >
                                Enviar a Educacion
                              </MDButton>
                            )}

                            {/* Enviar a Prov (solo Admin/SuperAdmin y estado E) */}
                            {(userRoles.includes("SuperAdmin") || userRoles.includes("Admin")) &&
                              estadoNorm === "E" && (
                                <MDButton
                                  variant="gradient"
                                  size="small"
                                  color="success"
                                  onClick={() => handleEnviarProvincia(row.original)}
                                >
                                  Enviar a Prov
                                </MDButton>
                              )}

                            {/* Info Bajas (cuando está en E) */}
                            {estadoNorm === "E" && (
                              <MDButton
                                variant="gradient"
                                size="small"
                                color="secondary"
                                onClick={() => handleDescargarCambios(row.original)}
                              >
                                Info Bajas
                              </MDButton>
                            )}

                            {/* Devolver: visible en cualquier estado excepto Rechazado */}
                            {!isRechazado && (
                              <MDButton
                                variant="gradient"
                                size="small"
                                color="error"
                                onClick={() => handleAbrirModalDevolver(row.original)}
                              >
                                Devolver
                              </MDButton>
                            )}
                          </MDBox>
                        );
                      },
                    },
                  ],
                  rows: dataTableData,
                }}
                entriesPerPage={false}
                canSearch
                show
              />
            </Card>
          </MDBox>
        )}
        <Dialog open={openDevolver} onClose={handleCerrarModalDevolver} fullWidth maxWidth="sm">
          <DialogTitle>Motivo de Devolución</DialogTitle>
          <DialogContent>
            <MDBox mt={1}>
              <TextField
                label="Observaciones"
                placeholder="Ingresá el motivo de la devolución..."
                fullWidth
                multiline
                minRows={3}
                value={devolucionObs}
                onChange={(e) => setDevolucionObs(e.target.value)}
              />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton variant="outlined" color="secondary" onClick={handleCerrarModalDevolver}>
              Cancelar
            </MDButton>
            <MDButton
              variant="gradient"
              color="error"
              onClick={handleGuardarDevolucion}
              disabled={!devolucionObs?.trim()}
            >
              Devolver
            </MDButton>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </>
  );
}

CabeceraMovimientos.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default CabeceraMovimientos;
