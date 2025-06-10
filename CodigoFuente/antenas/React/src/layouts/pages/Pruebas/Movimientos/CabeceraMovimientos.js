import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import GeneradorPDF from "./GeneradorPDF";
import "../../Pruebas/pruebas.css";

function CabeceraMovimientos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const token = sessionStorage.getItem("token");

  /*useEffect(() => {
    fetchConceptos();
  }, []);

  const fetchConceptos = () => {
    axios
      .get(process.env.REACT_APP_API_URL + "", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Datos recibidos del backend:", response.data);
        setDataTableData(response.data);
      })
      .catch((error) => {
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
      });
  };*/
  useEffect(() => {
    // Simulación de datos en lugar del fetch
    const fakeData = [
      {
        area: "Recursos Humanos",
        año: 2024,
        mes: "Junio",
        diegep: "6952",
        establecimiento: "Hospital Central",
        estado: "Pendiente",
        docente: {
          nDNI: 41307725,
          secuencia: "004",
          apellido: "CARDARELLI",
          nombre: "MARIA CECILIA",
          sitRevista: 2,
          tipoDocumento: "DNI",
          Funcion: "E",
          Rural: 0,
          Turno: "M/T",
          Categoria: 20121,
          nHoras: 5,
          años: 14,
          meses: 1,
          observaciones: "MODIFICA FUNCION A PARTIR DEL 05/03/2025",
        },
      },
      {
        area: "Contabilidad",
        año: 2023,
        mes: "Mayo",
        establecimiento: "Clínica Sur",
        diegep: "6923",
        estado: "Enviado",
        docente: [
          {
            nDNI: 41307725,
            secuencia: "004",
            apellido: "CARDARELLI",
            nombre: "MARIA CECILIA",
            sitRevista: 24,
            tipoDocumento: "DNI",
            cargoSec: "042",
            funcion: "E",
            rural: 0,
            turno: "M/T",
            categoria: "SV",
            nHoras: 5,
            anos: 14,
            meses: 1,
            observaciones:
              "MODIFICA FUNCION A PARTIR DEL 05/03/2025 ACTIVA SECUENCIA POR SIN DE LICENCIA SIN HABERES",
          },
          {
            nDNI: 212351132,
            secuencia: "052",
            apellido: "GARCIA",
            nombre: "LAURA",
            sitRevista: 21,
            tipoDocumento: "DNI",
            funcion: "J",
            rural: 5,
            turno: "M",
            cargoSec: "009",
            categoria: "D2",
            nHoras: 10,
            anos: 20,
            meses: 5,
            observaciones: "ASIGNACIONES FAMILIARES",
          },
          {
            nDNI: 30544912,
            secuencia: "060",
            apellido: "PEREZ",
            nombre: "JUAN MANUEL",
            sitRevista: 22,
            tipoDocumento: "DNI",
            cargoSec: "010",
            funcion: "P",
            rural: 1,
            turno: "T",
            categoria: "C1",
            nHoras: 12,
            anos: 10,
            meses: 3,
            observaciones: "CUBRE LICENCIA POR MATERNIDAD",
          },
          {
            nDNI: 27893456,
            secuencia: "073",
            apellido: "LOPEZ",
            nombre: "CAROLINA",
            sitRevista: 20,
            tipoDocumento: "DNI",
            cargoSec: "015",
            funcion: "E",
            rural: 0,
            turno: "V",
            categoria: "B2",
            nHoras: 8,
            anos: 5,
            meses: 6,
            observaciones: "NUEVA DESIGNACIÓN A PARTIR DEL 01/04/2025",
          },
          {
            nDNI: 32987123,
            secuencia: "081",
            apellido: "MARTINEZ",
            nombre: "ROBERTO",
            sitRevista: 23,
            tipoDocumento: "DNI",
            cargoSec: "007",
            funcion: "J",
            rural: 2,
            turno: "N",
            categoria: "D1",
            nHoras: 15,
            anos: 18,
            meses: 9,
            observaciones: "TOMA INTERINATO TEMPORAL",
          },
          {
            nDNI: 23987456,
            secuencia: "088",
            apellido: "FERNANDEZ",
            nombre: "LORENA",
            sitRevista: 25,
            tipoDocumento: "DNI",
            cargoSec: "022",
            funcion: "P",
            rural: 3,
            turno: "M/T",
            categoria: "A3",
            nHoras: 6,
            anos: 12,
            meses: 2,
            observaciones: "RENOVACIÓN CONTRATO ANUAL",
          },
        ],
      },
      {
        area: "Mantenimiento",
        año: 2024,
        mes: "Abril",
        diegep: "3255",
        establecimiento: "Centro de Salud Norte",
        estado: "Finalizado",
        docente: {
          nDNI: 41307725,
          secuencia: "004",
          apellido: "CARDARELLI",
          nombre: "MARIA CECILIA",
          sitRevista: 2,
          tipoDocumento: "DNI",
          funcion: "E",
          rural: 0,
          turno: "M/T",
          categoria: 20121,
          nHoras: 5,
          años: 14,
          meses: 1,
          observaciones:
            "MODIFICA FUNCION A PARTIR DEL 05/03/2025 ACTIVA SECUENCIA POR SIN DE LICENCIA SIN HABERES",
        },
      },
      {
        area: "Administración",
        año: 2022,
        mes: "Diciembre",
        diegep: "2341",
        establecimiento: "Hospital Este",
        estado: "Finalizado",
        docente: {
          nDNI: 41307725,
          secuencia: "004",
          apellido: "CARDARELLI",
          nombre: "MARIA CECILIA",
          sitRevista: 2,
          tipoDocumento: "DNI",
          funcion: "E",
          rural: 0,
          turno: "M/T",
          categoria: 20121,
          nHoras: 5,
          años: 14,
          meses: 1,
          observaciones:
            "MODIFICA FUNCION A PARTIR DEL 05/03/2025 ACTIVA SECUENCIA POR SIN DE LICENCIA SIN HABERES",
        },
      },
    ];
    setDataTableData(fakeData);
  }, []);

  const handleNuevoMovimiento = () => {
    navigate("/CabeceraMovimientos/Nuevo");
  };

  const handleImprimir = async (movimiento) => {
    try {
      await GeneradorPDF.generar(movimiento);
    } catch (error) {
      setErrorAlert({
        show: true,
        message: "Error al generar el PDF",
        type: "error",
      });
    }
  };

  return (
    <>
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <MDButton variant="gradient" color="success" onClick={handleNuevoMovimiento}>
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
        <MDBox my={3}>
          <Card>
            <DataTable
              table={{
                columns: [
                  { Header: "Area", accessor: "area" },
                  { Header: "Año", accessor: "año" },
                  { Header: "Mes", accessor: "mes" },
                  { Header: "Establecimiento", accessor: "establecimiento" },
                  { Header: "Estado", accessor: "estado" },
                  {
                    Header: "Acciones",
                    accessor: "acciones",
                    Cell: ({ row }) =>
                      row.original.estado === "Enviado" && (
                        <MDButton
                          variant="gradient"
                          color="info"
                          onClick={() => handleImprimir(row.original)}
                        >
                          Imprimir
                        </MDButton>
                      ),
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
