// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import MDButton from "components/MDButton";

//Para que el form se pueda utilizar de edicion se tiene que pasar "steps" "apiUrl" "productId" ej: <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
//Para que sea de crear ej: <Formulario steps={steps} apiUrl={apiUrl} />

function ConservadoraVer() {
  const { id } = useParams();
  console.log("ID:", id);
  const [conservadoraData, setConservadoraData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(`https://localhost:44382/conservadora/getbyid?id=${id}`)
      .then((response) => {
        setConservadoraData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  const handleEditarConservadora = (idConservadora) => {
    console.log("Editar datos:", idConservadora);
    const productId = idConservadora;
    console.log("Id deproductoID:" + productId);
    const url = `/dashboards/Conservadora/Edit/${productId}`;
    console.log("URL de redirección:", url);
    navigate(url);
    console.log("se paso la url");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {conservadoraData && (
        <>
          <MDBox>
            <Card>
              <div>
                <p className="tituloModal">Información de la Conservadora</p>
                <div className="contenidoCard">
                  <p>ID: {conservadoraData.idConservadora}</p>
                  <p>Nombre: {conservadoraData.nombre}</p>
                  <p>Telefono: {conservadoraData.telefono}</p>
                  <p>Email: {conservadoraData.email}</p>
                  <p>Departamente: {conservadoraData.dto}</p>
                </div>
                {/* Agrega aquí más campos de acuerdo a la estructura de conservadoraData */}
              </div>
              <MDButton onClick={() => handleEditarConservadora(conservadoraData.idConservadora)}>
                Editar
              </MDButton>
            </Card>
          </MDBox>
          <MDBox mt={2}>
            {conservadoraData.eV_Maquina.length > 0 ? (
              conservadoraData.eV_Maquina.map((maquina) => (
                <Card key={maquina.idMaquina} className="card">
                  <p className="tituloModal">Información de la Máquina</p>
                  <Card>
                    <div className="contenidoCard">
                      <p>Capacidad de Carga: {maquina.capacidadCarga}</p>
                      <p>Número de Serie: {maquina.nroSerie}</p>
                      <p>Tipo de Equipamiento: {maquina.eV_TipoEquipamiento.descripcion}</p>
                      <p>Id Obra: {maquina.idObra}</p>
                    </div>
                    {/* Agrega aquí más información de la máquina si es necesario */}
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

export default ConservadoraVer;
