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

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function AntenaVer() {
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
          Authorization: `Bearer ${token}`, // Envía el token en los headers
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
          Authorization: `Bearer ${token}`, // Envía el token en los headers
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
          <MDBox>
            <Card>
              <div>
                <p className="tituloModal">Información de la Antena</p>
                <div className="contenidoCard">
                  <p>Altura soporte: {conservadoraData.idConservadora}</p>
                  <p>Altura total: {conservadoraData.nombre}</p>
                  <p>
                    Codigo sitio:
                    {conservadoraData.idCalle} {conservadoraData.altura}
                  </p>
                  <p>Declarada: {conservadoraData.telefono}</p>
                  <p>Emplazamiento: {conservadoraData.email}</p>
                  <p>Tipo mimetizado: {conservadoraData.dto}</p>
                  <p>Obsercaviones: {conservadoraData.dto}</p>
                </div>
                {/* Agrega aquí más campos de acuerdo a la estructura de conservadoraData */}
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
                      { Header: "Nombre Obra", accessor: "eV_Obra.nombre" }, // Accede al nombre de la obra dentro de cada máquina
                      { Header: "Id Maquina", accessor: "idMaquina" },
                      { Header: "Tipo Equipamiento", accessor: "eV_TipoEquipamiento.descripcion" }, // Ajusta según la estructura de tus datos
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
AntenaVer.propTypes = {
  row: PropTypes.object, // Add this line for 'row' prop
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};
export default AntenaVer;
