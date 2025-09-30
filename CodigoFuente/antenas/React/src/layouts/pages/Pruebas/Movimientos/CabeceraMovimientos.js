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
import { BajasModificacionesPDF } from "./BajasModificacionesPDF";
import "../../Pruebas/pruebas.css";

function CabeceraMovimientos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
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
      if (userRolesFromToken.includes("SuperAdmin")) {
        const movimientosResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}MovimientosCabecera/GetAllCabeceras`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDataTableData(movimientosResponse.data);
      } else {
        // Traer ids de establecimientos asociados y roles
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

        // Luego traigo todos los movimientos
        const movimientosResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}MovimientosCabecera/GetAllCabeceras`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // filtro en base a idsEstablecimientos
        const movimientosFiltrados = movimientosResponse.data.filter((movimiento) =>
          idsEstablecimientos.includes(movimiento.idEstablecimiento)
        );
        setDataTableData(movimientosFiltrados);
      }
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
      // 1. Obtener la cabecera con los docentes incluidos
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
        docentes: data.docentes.map((docente) => ({
          nDNI: docente.numDoc,
          nombre: docente.nombre,
          apellido: docente.apellido,
          turno: docente.turno,
          nHoras: docente.horas?.toString() || "0",
          anos: docente.antigAnios?.toString() || "0",
          meses: docente.antigMeses?.toString() || "0",
          sitRevista: docente.sitRevista,
          secuencia: docente.secuencia != null ? docente.secuencia : "",
          observaciones: docente.observaciones || "",
          tipoMovimiento: docente.tipoMovimiento,
          tipoDoc: docente.tipoDoc,
          categoria: docente.categoria,
          funcion: docente.funcion,
          ruralidad: data.ruralidad,
        })),
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
                        ];
                        const estadoEncontrado = estados.find((e) => e.value === value);
                        return estadoEncontrado ? estadoEncontrado.label : value;
                      },
                    },
                    {
                      Header: "Acciones",
                      accessor: "acciones",
                      Cell: ({ row }) => {
                        const estado = row.original.estado;
                        const tieneBajas = row.original.tipoMovimiento === "B";
                        const tieneModificaciones = row.original.tipoMovimiento === "M";
                        return (
                          <MDBox display="flex" gap={1}>
                            {((estado === "P" &&
                              (userRoles.includes("Secretario") ||
                                userRoles.includes("Admin") ||
                                userRoles.includes("SuperAdmin"))) ||
                              (estado === "E" &&
                                (userRoles.includes("Admin") ||
                                  userRoles.includes("SuperAdmin")))) && (
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
                            {estado === "P" && (
                              <MDButton
                                variant="gradient"
                                size="small"
                                color="secondary"
                                onClick={() => handleEnviarEducacion(row.original)}
                              >
                                Enviar a Educacion
                              </MDButton>
                            )}
                            {(userRoles.includes("SuperAdmin") || userRoles.includes("Admin")) &&
                              estado == "E" && (
                                <MDButton
                                  variant="gradient"
                                  size="small"
                                  color="success"
                                  onClick={() => handleEnviarProvincia(row.original)}
                                >
                                  Enviar a Prov
                                </MDButton>
                              )}
                            {estado === "E" && (
                              <MDButton
                                variant="gradient"
                                size="small"
                                color="secondary"
                                onClick={() => handleDescargarCambios(row.original)}
                              >
                                Info Bajas
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
