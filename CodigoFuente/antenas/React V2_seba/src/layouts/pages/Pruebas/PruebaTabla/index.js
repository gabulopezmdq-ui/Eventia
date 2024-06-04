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
const exampleData = [
  { id: 1, name: "Producto 1", price: 10.99 },
  { id: 2, name: "Producto 2", price: 12.99 },
  { id: 3, name: "Producto 3", price: 13.99 },
];

function PruebaTabla() {
  const navigate = useNavigate();
  const [dataTableData, setDataTableData] = useState();
  useEffect(() => {
    axios
      .get("https://localhost:44382/CF_Procesos/")
      .then((response) => setDataTableData(response.data))
      .catch((error) => console.error("Error al obtener los datos:", error));
  }, []);

  const handleDelete = (rowData) => {
    const id = rowData.id;
    console.log("ID a eliminar:", id);
    axios
      .delete(`https://localhost:44382/CF_Procesos?id=${id}`)
      .then((response) => {
        console.log("Eliminado exitosamente:", response.data);
        setDataTableData((prevData) => prevData.filter((row) => row.id !== id));
      })
      .catch((error) => {
        console.error("Error al eliminar los datos:", error);
      });
  };
  const handleEdicion = (rowData) => {
    console.log("Editar datos:", rowData);
    const productId = rowData.id;
    console.log(productId);
    const url = `/dashboards/PruebaForm/${productId}`;
    console.log("URL de redirección:", url);
    navigate(url);
    console.log("se paso la url");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Link to="/dashboards/PruebaForm">
            <MDButton variant="gradient" color="success">
              new order
            </MDButton>
          </Link>
        </MDBox>
        <Card>
          <DataTable
            table={{
              columns: [
                //{ Header: "ID", accessor: "id" },
                { Header: "Nombre", accessor: "nombre" },
                { Header: "Descripcion", accessor: "descripcion" },
                { Header: "Source", accessor: "source" },
                { Header: "DataSource", accessor: "dataSource" },
                {
                  Header: "Editar",
                  accessor: "edit",
                  Cell: ({ row }) => (
                    <Link to={`/dashboards/PruebaForm/${row.original.id}`}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={() => handleEdicion(row.original)}
                      >
                        Editar
                      </MDButton>
                    </Link>
                  ),
                },
                {
                  Header: "Eliminar",
                  accessor: "eliminar",
                  Cell: ({ row }) => (
                    <MDButton
                      variant="gradient"
                      color="error"
                      onClick={() => handleDelete(row.original)}
                    >
                      Eliminar
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
  );
}

PruebaTabla.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default PruebaTabla;
