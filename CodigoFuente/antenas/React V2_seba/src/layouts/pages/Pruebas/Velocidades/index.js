import { useState, useEffect } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import { Link, useNavigate } from "react-router-dom";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Velocidades() {
  const navigate = useNavigate();
  const [dataTableData, setDataTableData] = useState();
  useEffect(() => {
    axios
      .get("https://localhost:44382/velocidad/GetAll")
      .then((response) => setDataTableData(response.data))
      .catch((error) => console.error("Error al obtener los datos:", error));
  }, []);

  const formatDate = (dateString) => {
    const fecha = new Date(dateString);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return fecha.toLocaleDateString("es-ES", options);
  };

  const handleNuevoTipo = () => {
    navigate("/dashboards/Velocidades/Nuevo");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDButton variant="gradient" color="success" onClick={handleNuevoTipo}>
        Agregar
      </MDButton>
      <MDBox my={3}>
        <Card>
          <DataTable
            table={{
              columns: [
                //{ Header: "ID", accessor: "id" },
                { Header: "Descripcion", accessor: "descripcion" },
                {
                  Header: "Actualizado",
                  accessor: "fechaAct",
                  Cell: ({ row }) => <span>{formatDate(row.original.fechaAct)}</span>,
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
  );
}

Velocidades.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default Velocidades;
