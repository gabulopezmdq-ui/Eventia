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

function UsuarioListados() {
  const navigate = useNavigate();
  const [dataTableData, setDataTableData] = useState();
  const handleDelete = (rowData) => {
    const id = rowData.idUsuario;
    console.log("ID a eliminar:", id);
    axios
      .delete(`https://localhost:44382/Usuarios?id=${id}`)
      .then((response) => {
        console.log("Eliminado exitosamente:", response.data);
        setDataTableData((prevData) => prevData.filter((row) => row.idUsuario !== id));
      })
      .catch((error) => {
        console.error("Error al eliminar los datos:", error);
      });
  };
  useEffect(() => {
    axios
      .get("https://localhost:44382/Usuarios/GetAll")
      .then((response) => setDataTableData(response.data))
      .catch((error) => console.error("Error al obtener los datos:", error));
  }, []);

  const handleNuevoUsuarioClick = () => {
    navigate("/dashboards/UsuariosListados/NuevoUsuario");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDButton variant="gradient" color="success" onClick={handleNuevoUsuarioClick}>
        Nuevo Usuario
      </MDButton>
      <MDBox my={3}>
        <Card>
          <DataTable
            table={{
              columns: [
                //{ Header: "ID", accessor: "id" },
                { Header: "Nombre", accessor: "nombre" },
                { Header: "Email", accessor: "email" },
                {
                  Header: "Acciones",
                  accessor: "acciones",
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

UsuarioListados.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default UsuarioListados;
