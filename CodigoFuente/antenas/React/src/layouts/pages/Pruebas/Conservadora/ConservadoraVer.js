// @mui material components
import Grid from "@mui/material/Grid";
import PropTypes from "prop-types";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import MDTypography from "components/MDTypography";

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function ConservadoraVer() {
  const { id } = useParams();
  const [conservadoraData, setConservadoraData] = useState(null);
  const [dataTableData, setDataTableData] = useState([]);
  const [dataTableDataTec, setDataTableDataTec] = useState([]);
  const [maquinasSinAsignarCount, setMaquinasSinAsignarCount] = useState(0);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `conservadora/getbyid?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        setConservadoraData(response.data);
        setDataTableData(response.data.eV_Maquina);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
    axios
      .get(process.env.REACT_APP_API_URL + `conservadora/GetRespTec?idCons=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setDataTableDataTec(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener el listado de tecnicos:", error);
      });

    axios
      .get(process.env.REACT_APP_API_URL + `maquina/GetXConsSinRespTec?idCons=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMaquinasSinAsignarCount(response.data.length);
      })
      .catch((error) => {
        console.error("Error al obtener el conteo de máquinas sin asignar:", error);
      });
  }, [id]);

  const handleEditarConservadora = (idConservadora) => {
    const productId = idConservadora;
    const url = `/ConservadoraFE/Edit/${productId}`;
    navigate(url);
  };

  const handleMaquinaSinAsignar = (idConservadora) => {
    const productId = idConservadora;
    const url = `/ConservadoraFE/MaquinaSinAsignar/${productId}`;
    navigate(url);
  };
  const handleEditarMaquina = (idMaquina) => {
    const productId = idMaquina;
    const url = `/MaquinaFE/Edit/${productId}`;
    navigate(url);
  };
  const handleEditarTecnico = (row) => {
    console.log("Id Reptecnico : " + row.idRepTecnico);
    const idConservadora = id;
    const productId = row.eV_ConservadoraEV_RepTecnico.idEVConsEVRespTec;
    const url = `/ConservadoraFE/Tecnico/${idConservadora}/${productId}`;
    navigate(url);
  };

  const handleDelete = (row) => {
    const { idRepTecnico } = row;
    axios
      .delete(
        process.env.REACT_APP_API_URL +
          `conservadora/DeleteRespTec?idCons=${id}&idRepTec=${idRepTecnico}`
      )
      .then((response) => {
        console.log("Técnico eliminado con éxito", response);
      })
      .catch((error) => {
        console.error("Error al eliminar el técnico:", error);
      });
  };
  const handleNuevoTecnico = () => {
    navigate(`/ConservadoraFE/Tecnico/${id}`);
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      {conservadoraData && (
        <>
          <MDBox mt={2} style={{ display: "flex" }}>
            <Card style={{ width: "100vw" }}>
              <MDBox display="flex">
                <MDBox
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width="4rem"
                  height="4rem"
                  variant="gradient"
                  bgColor="info"
                  color="white"
                  shadow="md"
                  borderRadius="xl"
                  ml={3}
                  mt={-2}
                >
                  <Icon fontSize="medium" color="inherit">
                    villa
                  </Icon>
                </MDBox>
                <MDTypography variant="h6" sx={{ mt: 2, mb: 1, ml: 2 }}>
                  Informacion de la Conservadora
                </MDTypography>
              </MDBox>
              <div className="contenidoCard">
                <MDTypography variant="h6">ID: {conservadoraData.idConservadora}</MDTypography>
                <MDTypography variant="h6">Nombre: {conservadoraData.nombre}</MDTypography>
                <MDTypography variant="h6">
                  Calle:
                  {conservadoraData.idCalle} {conservadoraData.altura}
                </MDTypography>
                <MDTypography variant="h6">Telefono: {conservadoraData.telefono}</MDTypography>
                <MDTypography variant="h6">Email: {conservadoraData.email}</MDTypography>
                <MDTypography variant="h6">Departamento: {conservadoraData.dto}</MDTypography>
              </div>
              <MDButton onClick={() => handleEditarConservadora(conservadoraData.idConservadora)}>
                Editar
              </MDButton>
            </Card>
          </MDBox>
          <MDBox mt={2} mb={2}>
            <MDButton variant="gradient" color="success" onClick={handleNuevoTecnico}>
              Agregar Tecnico
            </MDButton>
            {dataTableDataTec.length > 0 ? (
              <>
                <MDBox mt={2} mb={1}>
                  <Card sx={{ justifyContent: "space-between" }}>
                    <p className="tituloModalMQ">Listado Tecnicos ({dataTableDataTec.length})</p>
                  </Card>
                </MDBox>
                <DataTable
                  table={{
                    columns: [
                      { Header: "Id RepTec", accessor: "idRepTecnico" },
                      { Header: "Nombre", accessor: "nombre" },
                      { Header: "Apellido", accessor: "apellido" },
                      { Header: "Telefono", accessor: "telefono" },
                      { Header: "MatProf", accessor: "matProf" },
                      { Header: "MatMuni", accessor: "matMuni" },
                      {
                        Header: "Editar",
                        accessor: "edit",
                        Cell: ({ row }) => (
                          <MDButton
                            variant="gradient"
                            color="info"
                            onClick={() => handleEditarTecnico(row.original)}
                          >
                            Editar
                          </MDButton>
                        ),
                      },
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
                    rows: dataTableDataTec,
                  }}
                  entriesPerPage={false}
                  canSearch
                  show
                />
              </>
            ) : (
              <MDBox mt={2}>
                <Card>
                  <p className="contenidoCard"> No posee tecnicos asignadas. </p>
                </Card>
              </MDBox>
            )}
          </MDBox>
          {maquinasSinAsignarCount > 0 && (
            <MDBox mt={2}>
              <Card sx={{ justifyContent: "space-between" }}>
                <p className="tituloModalMQ">
                  Maquinas sin asignar ({maquinasSinAsignarCount})
                  <MDButton
                    onClick={() => handleMaquinaSinAsignar(conservadoraData.idConservadora)}
                  >
                    Ver
                  </MDButton>
                </p>
              </Card>
            </MDBox>
          )}
          <MDBox mt={2}>
            {dataTableData.length > 0 ? (
              <>
                <MDBox mb={1}>
                  <Card sx={{ justifyContent: "space-between" }}>
                    <p className="tituloModalMQ">
                      Informacion Maquinas ({conservadoraData.eV_Maquina.length})
                    </p>
                  </Card>
                </MDBox>
                <DataTable
                  table={{
                    columns: [
                      { Header: "Id Obra", accessor: "idObra" },
                      { Header: "Nombre Obra", accessor: "eV_Obra.nombre" },
                      { Header: "Id Maquina", accessor: "idMaquina" },
                      { Header: "Tipo Equipamiento", accessor: "eV_TipoEquipamiento.descripcion" },
                      { Header: "Velocidad", accessor: "eV_Velocidades.descripcion" },
                      {
                        Header: "",
                        accessor: "edit",
                        Cell: ({ row }) => (
                          <MDButton
                            variant="gradient"
                            color="info"
                            onClick={() => handleEditarMaquina(row.values.idMaquina)}
                          >
                            Edicion
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
              </>
            ) : (
              <MDBox>
                <Card>
                  <p className="contenidoCard"> No posee máquinas asignadas. </p>
                </Card>
              </MDBox>
            )}
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}
ConservadoraVer.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};
export default ConservadoraVer;
