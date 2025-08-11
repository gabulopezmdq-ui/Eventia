import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import InasistenciaModal from "../DetalleTabla/PopUp/InasistenciaModal";
import axios from "axios";
import CardContent from "@mui/material/CardContent";

const TablaInasistenciasDetalle = ({ inasistencias }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = (row) => {
    setSelectedRow({ ...row, idCabecera: inasistencias.idCabecera });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  const handleCargar = async ({ fechaDesde, fechaHasta, idCabecera, idInasistenciaCabecera }) => {
    try {
      setIsLoading(true);
      const desdeStr = fechaDesde.format("YYYY-MM-DD");
      const hastaStr = fechaHasta.format("YYYY-MM-DD");

      const url = `${process.env.REACT_APP_API_URL}docentesHistorico/ImportarInas`;

      // Pasamos los parámetros en un objeto 'params' para que axios arme el query string
      const response = await axios.post(url, null, {
        params: {
          desde: desdeStr,
          hasta: hastaStr,
          idCabecera: idCabecera,
          idInasistenciasCabecera: idInasistenciaCabecera,
        },
      });

      if (response.status !== 200) throw new Error(`Error: ${response.statusText}`);

      const data = response.data;
      console.log("Respuesta:", data);

      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Error al cargar inasistencias: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (
    !inasistencias ||
    !Array.isArray(inasistencias.detalle) ||
    inasistencias.detalle.length === 0
  ) {
    return null;
  }

  const AccionesCell = ({ row }) => {
    const { original } = row;
    return (
      <MDBox display="flex" gap={1}>
        {original.estado === "H" && (
          <MDButton
            variant="gradient"
            color="warning"
            size="small"
            onClick={() => handleOpenModal(original)}
          >
            Cargar Inasistencia
          </MDButton>
        )}
      </MDBox>
    );
  };

  AccionesCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        estado: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  return (
    <>
      <MDBox mt={3}>
        <Card>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" component="div">
                  {inasistencias.descripcion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Periodo: {inasistencias.mes}/{inasistencias.anio}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Fecha Apertura:{new Date(inasistencias.fechaApertura).toLocaleDateString("es-AR")}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </MDBox>
      <MDBox mt={3}>
        <Card>
          <DataTable
            table={{
              columns: [
                { Header: "ID Detalle", accessor: "idInasistenciaDetalle" },
                { Header: "ID POF", accessor: "idPOF" },
                {
                  Header: "Fecha Inasistencia",
                  accessor: "fechaInasistencia",
                  Cell: ({ value }) => new Date(value).toLocaleDateString("es-AR"),
                },
                { Header: "Estado", accessor: "estado" },
                {
                  Header: "Acciones",
                  accessor: "acciones",
                  Cell: AccionesCell,
                },
              ],
              rows: inasistencias.detalle.map((item) => ({
                idInasistenciaDetalle: item.idInasistenciaDetalle,
                idInasistenciaCabecera: item.idInasistenciaCabecera,
                idPOF: item.idPOF,
                fechaInasistencia: item.fechaInasistencia,
                estado: item.estado,
              })),
            }}
            entriesPerPage={false}
            showTotalEntries={false}
            isSorted={false}
            canSearch={false}
          />
        </Card>
      </MDBox>
      <InasistenciaModal
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleCargar}
        mes={inasistencias.mes}
        anio={inasistencias.anio}
        initialData={selectedRow}
        isLoading={isLoading} // pasamos loading
      />
    </>
  );
};

TablaInasistenciasDetalle.propTypes = {
  inasistencias: PropTypes.shape({
    descripcion: PropTypes.string,
    anio: PropTypes.number,
    mes: PropTypes.number,
    idCabecera: PropTypes.number,
    fechaApertura: PropTypes.string,
    detalle: PropTypes.arrayOf(
      PropTypes.shape({
        idInasistenciaDetalle: PropTypes.number,
        idInasistenciaCabecera: PropTypes.number,
        idPOF: PropTypes.number,
        fechaInasistencia: PropTypes.string,
        estado: PropTypes.string,
      })
    ),
  }),
};

export default TablaInasistenciasDetalle;
