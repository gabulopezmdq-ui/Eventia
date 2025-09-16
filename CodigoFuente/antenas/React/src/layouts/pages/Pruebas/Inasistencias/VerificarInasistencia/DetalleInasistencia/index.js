import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";

function DetalleInasistencia({ idCabecera, mes, año }) {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = sessionStorage.getItem("token");

  /*Fijarse si es post o get*/
  /*useEffect(() => {
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
  }, [idCabecera, mes, año, token]);*/

  useEffect(() => {
    // Simular delay como si fuera API
    setTimeout(() => {
      setDetalles([
        {
          idDetalle: 1,
          idInasistencia: 120,
          idCabecera: idCabecera,
          establecimiento: "Escuela N°1",
          mes: mes,
          anio: año,
          dni: "30111222",
          sec: "SEC-01",
          apellido: "García",
          nombre: "Juan",
          cargo: "Docente",
          diasInas: 2,
          horasInas: 4,
          minInas: 30,
          estado: "Pendiente",
          obsEstablecimiento: "Inasistencia justificada",
          fechaEntrega: "2025-09-10",
          entrego: "Directora",
          obsSecretaria: "",
        },
        {
          idDetalle: 2,
          idInasistencia: 158,
          idCabecera: idCabecera,
          establecimiento: "Escuela N°1",
          mes: mes,
          anio: año,
          dni: "30222333",
          sec: "SEC-02",
          apellido: "Pérez",
          nombre: "Ana",
          cargo: "Preceptora",
          diasInas: 1,
          horasInas: 2,
          minInas: 0,
          estado: "Pendiente",
          obsEstablecimiento: "Enfermedad común",
          fechaEntrega: "2025-09-10",
          entrego: "Directora",
          obsSecretaria: "",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [idCabecera, mes, año]);

  const handleAceptar = async (row) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}inasistenciascabecera/AprobarInas`,
        {
          idInasistencia: row.idInasistencia,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Inasistencia ${row.idInasistencia} aceptada correctamente`);
    } catch (err) {
      console.error(err);
      alert("Error al aceptar inasistencia");
    }
  };

  const handleRechazar = async (row) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}inasistenciascabecera/RechazarInas`,
        {
          idInasDetalle: row.idInasistencia,
          observaciones: row.obsSecretaria || "Sin observaciones",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Inasistencia ${row.idInasistencia} rechazada correctamente`);
    } catch (err) {
      console.error(err);
      alert("Error al rechazar inasistencia");
    }
  };

  const handleDevolver = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}inasistenciascabecera/Devolver`,
        {
          idCabecera: idCabecera,
          motivoRechazo: detalles[0]?.obsSecretaria || "Sin motivo",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Se devolvió correctamente al establecimiento");
    } catch (err) {
      console.error(err);
      alert("Error al devolver al establecimiento");
    }
  };

  const handleCorregido = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}inasistenciascabecera/Corregido`,
        {
          params: { idCabecera },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Respuesta corregido:", res.data);
      alert("Marcado como corregido por Educación");
    } catch (err) {
      console.error(err);
      alert("Error al marcar como corregido");
    }
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
  const AccionesCell = ({ row }) => (
    <MDBox display="flex" gap={1}>
      <MDButton
        variant="gradient"
        color="success"
        size="small"
        onClick={() => handleAceptar(row.original)}
      >
        ✓
      </MDButton>
      <MDButton
        variant="gradient"
        color="error"
        size="small"
        onClick={() => handleRechazar(row.original)}
      >
        x
      </MDButton>
    </MDBox>
  );

  AccionesCell.propTypes = {
    row: PropTypes.object.isRequired,
  };
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
                Cell: AccionesCell,
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
          <strong>Observaciones Establecimiento: </strong>
          {""}
          {detalles[0]?.obsEstablecimiento || "—"}
        </MDTypography>
        <MDTypography variant="body2">
          <strong>Fecha Entrega: </strong>
          {""}
          {detalles[0]?.fechaEntrega || "—"}
        </MDTypography>
        <MDTypography variant="body2">
          <strong>Entrego: </strong>
          {""}
          {detalles[0]?.entrego || "—"}
        </MDTypography>
        <MDBox mt={2}>
          <MDTypography variant="body2" mb={1}>
            <strong>Observaciones Secretaría:</strong>
          </MDTypography>
          <MDInput
            fullWidth
            multiline
            rows={3}
            placeholder="Escriba observaciones..."
            value={detalles[0]?.obsSecretaria || ""}
            onChange={(e) => {
              const nuevasObs = e.target.value;
              setDetalles((prev) => {
                const copia = [...prev];
                copia[0].obsSecretaria = nuevasObs;
                return copia;
              });
            }}
          />
        </MDBox>

        <MDBox mt={2} display="flex" justifyContent="flex-end" gap={2}>
          <MDButton variant="gradient" color="warning" size="small" onClick={handleDevolver}>
            Devolver a Establecimiento
          </MDButton>
          <MDButton variant="gradient" color="info" size="small" onClick={handleCorregido}>
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
