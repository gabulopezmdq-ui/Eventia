import React, { useState } from "react";
import PropTypes from "prop-types";
import { Card } from "@mui/material";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import AgregarInasistenciaModal from "./AgregarInasistenciaPopUp";

const TablaProcesados = ({ data, onAgregarInasistencia }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const AccionesCell = ({ row }) => {
    const original = row.original;
    return (
      <MDBox display="flex" gap={1}>
        <MDButton
          variant="gradient"
          color="info"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRow(original);
          }}
        >
          Agregar Inasistencia
        </MDButton>
      </MDBox>
    );
  };
  AccionesCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        dni: PropTypes.string,
        nroLegajo: PropTypes.string,
        nroCargo: PropTypes.string,
        ue: PropTypes.string,
        grupo: PropTypes.string,
        nivel: PropTypes.string,
        modulo: PropTypes.string,
        cargo: PropTypes.string,
        fecNov: PropTypes.string,
        codLicen: PropTypes.string,
        cantidad: PropTypes.number,
        hora: PropTypes.string,
        idInasistenciaCabecera: PropTypes.number,
      }).isRequired,
    }).isRequired,
  };

  return (
    <>
      <Card sx={{ mt: 3 }}>
        <DataTable
          table={{
            columns: [
              { Header: "DNI", accessor: "tmpDetalle.dni" },
              { Header: "Nº Legajo", accessor: "tmpDetalle.nroLegajo" },
              { Header: "Nº Cargo", accessor: "tmpDetalle.nroCargo" },
              { Header: "U.E", accessor: "tmpDetalle.ue" },
              { Header: "Grupo", accessor: "tmpDetalle.grupo" },
              { Header: "Nivel", accessor: "tmpDetalle.nivel" },
              { Header: "Modulo", accessor: "tmpDetalle.modulo" },
              { Header: "Cargo", accessor: "tmpDetalle.cargo" },
              {
                Header: "FecNov",
                accessor: "tmpDetalle.fecNov",
                Cell: ({ value }) => {
                  if (!value) return "";
                  const d = new Date(value);
                  return d.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                },
              },
              { Header: "CodLicen", accessor: "tmpDetalle.codLicen" },
              { Header: "Cantidad", accessor: "tmpDetalle.cantidad" },
              { Header: "Hora", accessor: "tmpDetalle.hora" },
              {
                Header: "Acciones",
                accessor: "acciones",
                Cell: AccionesCell,
              },
            ],
            rows: data,
          }}
          entriesPerPage={false}
          canSearch
        />
      </Card>

      {selectedRow && (
        <AgregarInasistenciaModal
          open={!!selectedRow}
          onClose={() => setSelectedRow(null)}
          row={selectedRow}
          onConfirm={(payload) => {
            onAgregarInasistencia(payload);
            setSelectedRow(null);
          }}
        />
      )}
    </>
  );
};

TablaProcesados.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      dni: PropTypes.string,
      nroLegajo: PropTypes.string,
      nroCargo: PropTypes.string,
      ue: PropTypes.string,
      grupo: PropTypes.string,
      nivel: PropTypes.string,
      modulo: PropTypes.string,
      cargo: PropTypes.string,
      fecNov: PropTypes.string,
      codLicen: PropTypes.string,
      cantidad: PropTypes.number,
      hora: PropTypes.string,
      idInasistenciaCabecera: PropTypes.number,
    })
  ).isRequired,
  onAgregarInasistencia: PropTypes.func.isRequired,
};

export default TablaProcesados;
