import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import jwt_decode from "jwt-decode";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

function SuperCabecera() {
  const navigate = useNavigate();
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "", type: "error" });
  const [dataTableData, setDataTableData] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchCabeceras();
  }, []);

  const fetchCabeceras = async () => {
    try {
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.id;

      const rolesKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      const userRolesFromToken = decodedToken[rolesKey] || [];
      setUserRoles(userRolesFromToken);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}MovimientosCabecera/GetAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let cabeceras = response.data;

      if (!userRolesFromToken.includes("SuperAdmin")) {
        const rolesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}MovimientosCabecera/RolesEst?id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { idsEstablecimientos } = rolesResponse.data;
        cabeceras = cabeceras.filter((c) => idsEstablecimientos.includes(c.idEstablecimiento));
      }

      setDataTableData(cabeceras);
    } catch (error) {
      console.error(error);
      setErrorAlert({
        show: true,
        message: "Error al obtener las cabeceras.",
        type: "error",
      });
    }
  };
  const handleNuevoSuperCabecera = () => {
    navigate("/SuperCabecera/Nuevo");
  };
  const convertirMes = (mesNumerico) => {
    const meses = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];
    return meses[mesNumerico - 1] || mesNumerico.toString();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <MDButton
          variant="gradient"
          size="small"
          color="success"
          onClick={handleNuevoSuperCabecera}
        >
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

      {dataTableData.length === 0 ? (
        <MDBox my={3}>
          <MDBox p={3} textAlign="center">
            No tiene cabeceras asociadas.
          </MDBox>
        </MDBox>
      ) : (
        <MDBox my={3}>
          <Card>
            <DataTable
              table={{
                columns: [
                  { Header: "Área", accessor: "area" },
                  { Header: "Año", accessor: "anio" },
                  {
                    Header: "Mes",
                    accessor: "mes",
                    Cell: ({ value }) => convertirMes(value),
                  },
                  {
                    Header: "Establecimiento",
                    accessor: "establecimiento.nroEstablecimiento",
                  },
                  {
                    Header: "Diegep",
                    accessor: "establecimiento.nroDiegep",
                  },
                  {
                    Header: "Nombre",
                    accessor: "establecimiento.nombrePcia",
                  },
                  {
                    Header: "Fecha",
                    accessor: "fecha",
                    Cell: ({ value }) => new Date(value).toLocaleDateString("es-AR"),
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
      )}
    </DashboardLayout>
  );
}

export default SuperCabecera;
