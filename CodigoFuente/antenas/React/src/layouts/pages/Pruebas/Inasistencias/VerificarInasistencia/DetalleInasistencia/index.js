import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";

function DetalleInasistencia({ idCabecera, mes, año }) {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}inasistenciascabecera/InasPendientes`,
          { idCabecera, mes, año },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDetalles(response.data);
      } catch (err) {
        setError("Error al cargar las inasistencias pendientes");
      } finally {
        setLoading(false);
      }
    };
    fetchDetalles();
  }, [idCabecera, mes, año, token]);

  const handleAceptar = (row) => {
    console.log("Aceptar:", row);
  };

  const handleRechazar = (row) => {
    console.log("Rechazar:", row);
  };

  if (loading) {
    return (
      <MDBox p={3}>
        <MDTypography variant="body2">Cargando detalles...</MDTypography>
      </MDBox>
    );
  }

  if (error) {
    return (
      <MDBox p={3}>
        <MDAlert color="error" dismissible>
          <MDTypography variant="body2" color="white">
            {error}
          </MDTypography>
        </MDAlert>
      </MDBox>
    );
  }

  if (detalles.length === 0) {
    return (
      <MDBox p={3}>
        <MDAlert color="warning" dismissible>
          <MDTypography variant="body2" color="white">
            No hay inasistencias pendientes.
          </MDTypography>
        </MDAlert>
      </MDBox>
    );
  }

  return (
    <>
      {/* Cabecera de información */}
      <Card sx={{ mt: 2, p: 2 }}>
        <MDTypography variant="body2">
          <strong>Establecimiento:</strong> {detalles[0]?.establecimiento}
        </MDTypography>
        <MDTypography variant="body2">
          <strong>Mes:</strong> {detalles[0]?.mes}
        </MDTypography>
        <MDTypography variant="body2">
          <strong>Año:</strong> {detalles[0]?.anio}
        </MDTypography>
      </Card>

      {/* Tabla de inasistencias */}
      <Card sx={{ mt: 2 }}>
        <DataTable
          table={{
            columns: [
              { Header: "DNI", accessor: "dni" },
              { Header: "SEC", accessor: "sec" },
              { Header: "Apellido", accessor: "apellido" },
              { Header: "Nombre", accessor: "nombre" },
              { Header: "Cargo", accessor: "cargo" },
              { Header: "Dias Inas", accessor: "diasInas" },
              { Header: "Horas Inas", accessor: "horasInas" },
              { Header: "Min Inas", accessor: "minInas" },
              { Header: "Estado", accessor: "estado" },
              {
                Header: "Acciones",
                accessor: "acciones",
                Cell: ({}) => (
                  <MDBox display="flex" gap={1}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      size="small"
                      onClick={() => handleAceptar(row.original)}
                    >
                      Aceptar
                    </MDButton>
                    <MDButton
                      variant="gradient"
                      color="error"
                      size="small"
                      onClick={() => handleRechazar(row.original)}
                    >
                      Rechazar
                    </MDButton>
                  </MDBox>
                ),
              },
            ],
            rows: detalles,
          }}
          entriesPerPage={false}
          showTotalEntries={false}
        />
      </Card>

      {/* Observaciones */}
      <Card sx={{ mt: 2, p: 2 }}>
        <MDTypography variant="body2">
          <strong>Observaciones Establecimiento:</strong>
          {""}
          {detalles[0]?.obsEstablecimiento || "—"}
        </MDTypography>
        <MDTypography variant="body2">
          <strong>Fecha Entrega:</strong>
          {""}
          {detalles[0]?.fechaEntrega || "—"}
        </MDTypography>
        <MDTypography variant="body2">
          <strong>Entregó:</strong>
          {""}
          {detalles[0]?.entrego || "—"}
        </MDTypography>
        <MDTypography variant="body2">
          <strong>Observaciones Secretaría:</strong>
          {""}
          {detalles[0]?.obsSecretaria || "—"}
        </MDTypography>

        <MDBox mt={2} display="flex" gap={2}>
          <MDButton
            variant="gradient"
            color="warning"
            onClick={() => console.log("Devolver a Establecimiento")}
          >
            Devolver a Establecimiento
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => console.log("Corregido Educación")}
          >
            Corregido Educación
          </MDButton>
        </MDBox>
      </Card>
    </>
  );
}

DetalleInasistencia.propTypes = {
  idCabecera: PropTypes.number.isRequired,
  mes: PropTypes.number.isRequired,
  año: PropTypes.number.isRequired,
};

export default DetalleInasistencia;
