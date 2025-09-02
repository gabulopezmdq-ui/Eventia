import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import Card from "@mui/material/Card";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import InasistenciaModal from "./PopUp/InasistenciaModal";
import axios from "axios";
import CardContent from "@mui/material/CardContent";
import { generatePDF } from "./GeneradorPDF";
import CabeceraLiquidacion from "../../CabeceraLiquidacion";

const TablaInasistenciasDetalle = ({ inasistencias, ue }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [procesados, setProcesados] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });

  const handleOpenModal = (row) => {
    setSelectedRow({ ...row, idCabecera: inasistencias.idCabecera });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
  };

  const handleCargar = async ({
    fechaDesde,
    fechaHasta,
    idCabecera,
    idInasistenciaCabecera,
    idInasistenciaDetalle,
  }) => {
    try {
      setIsLoading(true);
      const desdeStr = fechaDesde.format("YYYY-MM-DD");
      const hastaStr = fechaHasta.format("YYYY-MM-DD");

      const url = `${process.env.REACT_APP_API_URL}docentesHistorico/ImportarInas`;

      const response = await axios.post(url, null, {
        params: {
          desde: desdeStr,
          hasta: hastaStr,
          idCabecera,
          idInasistenciasCabecera: idInasistenciaCabecera,
        },
      });

      if (response.status !== 200) throw new Error(`Error: ${response.statusText}`);
      setProcesados((prev) => [...prev, idInasistenciaDetalle]);

      handleCloseModal();
      setErrorAlert({
        show: true,
        message: response.data,
        type: "success",
      });
      setTimeout(() => {
        setErrorAlert((prev) => ({ ...prev, show: false }));
      }, 4000);
    } catch (error) {
      console.error(error);
      alert("Error al cargar inasistencias: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcesar = async (row) => {
    try {
      setIsLoading(true);

      const url = `${process.env.REACT_APP_API_URL}inasistenciascabecera/procesar`;

      const payload = {
        IdCabeceraLiquidacion: row.idCabecera,
        IdCabeceraInasistencia: row.idInasistenciaCabecera,
        IdEstablecimiento: row.idEstablecimiento,
        UE: ue,
      };

      const response = await axios.post(url, payload);

      if (response.status !== 200) throw new Error(`Error: ${response.statusText}`);

      setErrorAlert({
        show: true,
        message: "Procesamiento generado correctamente",
        type: "success",
      });

      setTimeout(() => {
        setErrorAlert((prev) => ({ ...prev, show: false }));
      }, 4000);
    } catch (error) {
      console.error(error);
      setErrorAlert({
        show: true,
        message: "Error al generar procesamiento: " + error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDescargarErrores = async () => {
    try {
      setIsLoading(true);
      const url = `${process.env.REACT_APP_API_URL}inasistenciascabecera/ErroresInas`;

      const response = await axios.get(url);

      if (response.status !== 200) throw new Error(`Error: ${response.statusText}`);
      await generatePDF(response.data);
    } catch (error) {
      console.error(error);
      setErrorAlert({
        show: true,
        message: "Error al descargar errores: " + error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const AccionesCell = ({ row }) => {
    const { original } = row;
    const yaProcesado = procesados.includes(original.idInasistenciaDetalle);

    return (
      <MDBox display="flex" gap={1}>
        {original.estado === "H" && !yaProcesado && (
          <MDButton
            variant="gradient"
            color="warning"
            size="small"
            onClick={() => handleOpenModal(original)}
          >
            Cargar Inasistencia
          </MDButton>
        )}

        {yaProcesado && (
          <MDButton
            variant="gradient"
            color="success"
            size="small"
            onClick={() => handleProcesar(original)}
          >
            Generar Procesamientos
          </MDButton>
        )}
        <MDButton variant="gradient" color="info" size="small" onClick={handleDescargarErrores}>
          Descargar Errores
        </MDButton>
      </MDBox>
    );
  };

  AccionesCell.propTypes = {
    row: PropTypes.shape({
      original: PropTypes.shape({
        estado: PropTypes.string.isRequired,
        idInasistenciaDetalle: PropTypes.number.isRequired,
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
      <MDBox mt={1}>
        <Card>
          <DataTable
            table={{
              columns: [
                { Header: "ID Detalle", accessor: "idInasistenciaDetalle" },
                { Header: "ID Cabecera", accessor: "idCabecera" }, // Mostrar idCabecera del root
                { Header: "ID Establecimiento", accessor: "idEstablecimiento" },
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
                idCabecera: inasistencias.idCabecera,
                idEstablecimiento: inasistencias.idEstablecimiento,
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
        isLoading={isLoading}
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
    idEstablecimiento: PropTypes.number,
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
  ue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TablaInasistenciasDetalle;
