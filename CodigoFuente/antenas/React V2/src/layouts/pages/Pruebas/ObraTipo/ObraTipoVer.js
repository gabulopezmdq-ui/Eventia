// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import MDButton from "components/MDButton";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function ObraTipoVer() {
  const { id } = useParams();
  console.log("ID:", id);
  const [obraData, setObraData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(`https://localhost:44382/obra/getbyid?id=${id}`)
      .then((response) => {
        setObraData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  const handleNuevaMaquina = () => {
    navigate(`/dashboards/Maquina/Nuevo/${obraData.idObra}`);
  };
  const handleEditarMaquina = (idMaquina) => {
    console.log("Editar datos:", idMaquina);
    const productId = idMaquina;
    console.log("Id deproductoID:" + productId);
    const url = `/dashboards/Maquina/Edit/${productId}`;
    console.log("URL de redirección:", url);
    navigate(url);
    console.log("se paso la url");
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      {obraData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">{obraData.nombre}</p>
              <div className="contenidoCard">
                <p>
                  <b>ID: </b>
                  {obraData.idObra}
                </p>
                <p>
                  <b>Calle: </b>
                  {obraData.idCalle}
                </p>
                <p>
                  <b>Email: </b>
                  {obraData.email}
                </p>
                <p>
                  <b>Departamento: </b>
                  {obraData.dto}
                </p>
                <p>
                  <b>Tipo de Obra: </b>
                  {obraData.eV_TipoObra.descripcion}
                </p>
              </div>
            </Card>
          </MDBox>
          <MDBox mt={2}>
            <MDButton variant="gradient" color="success" onClick={handleNuevaMaquina}>
              Agregar Maquina
            </MDButton>
          </MDBox>
          <MDBox mt={2}>
            {obraData.eV_Maquina.length > 0 ? (
              obraData.eV_Maquina.map((maquina) => (
                <Card key={maquina.idMaquina} className="card">
                  <p className="tituloModal">Información de la Máquina ( {maquina.nroSerie} )</p>
                  <Card>
                    <div className="contenidoCard">
                      <p>
                        <b>Tipo de Equipamiento: </b>
                        {maquina.eV_TipoEquipamiento.descripcion}
                      </p>
                      <p>
                        <b>Número de Serie: </b>
                        {maquina.nroSerie}
                      </p>
                      <p>
                        <b>Capacidad de Carga: </b>
                        {maquina.capacidadCarga}
                      </p>
                      {/* Agrega aquí más información de la máquina si es necesario */}
                    </div>
                    <MDButton onClick={() => handleEditarMaquina(maquina.idMaquina)}>
                      Editar
                    </MDButton>
                  </Card>
                </Card>
              ))
            ) : (
              <MDBox>
                <Card>
                  <p className="contenidoCard">No posee máquinas registradas.</p>
                </Card>
              </MDBox>
            )}
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}

export default ObraTipoVer;
