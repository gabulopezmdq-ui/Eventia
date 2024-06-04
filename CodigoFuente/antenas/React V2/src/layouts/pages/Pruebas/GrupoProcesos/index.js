import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

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

function GrupoProcesos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [dataTableData, setDataTableData] = useState([]);
  useEffect(() => {
    console.log("Id que recibo", id);
    axios
      .get(`https://localhost:44382/CF_Procesos/${id}`) // Usa el id de la URL para obtener datos específicos
      .then((response) => {
        const responseData = Array.isArray(response.data) ? response.data : [response.data];
        setDataTableData(responseData);
      })
      .catch((error) => console.error("Error al obtener los datos:", error));
  }, [id]);

  const handleEdicion = (rowData) => {
    if (rowData && rowData.id) {
      console.log("Editar datos:", rowData);
      const productId = rowData.id;
      console.log(productId);
      const url = `/dashboards/PruebaForm/${productId}`;
      console.log("URL de redirección:", url);
      navigate(url);
      console.log("se paso la url");
    } else {
      console.error("El objeto rowData o su propiedad 'id' no están definidos.");
    }
  };

  const handleNuevoProceso = () => {
    navigate("/dashboards/Configurador/NuevoProceso");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDButton variant="gradient" color="success" onClick={handleNuevoProceso}>
        Nuevo Proceso
      </MDButton>
      <MDBox my={3}>
        <Card>
          <DataTable
            table={{
              columns: [
                //{ Header: "ID", accessor: "id" },
                { Header: "Nombre", accessor: "nombre" },
                { Header: "Descripcion", accessor: "descripcion" },
                {
                  Header: "Mas Info",
                  accessor: "edit",
                  Cell: ({ row }) => (
                    <Link to={`/dashboards/Configurador/Proceso/${row.original.id}`}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleEdicion(row.original)}
                      >
                        Mas Info
                      </MDButton>
                    </Link>
                  ),
                },
              ],
              rows: dataTableData || [],
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

GrupoProcesos.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default GrupoProcesos;
