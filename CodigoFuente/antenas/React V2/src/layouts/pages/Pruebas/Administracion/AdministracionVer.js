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

function AdministracionVer() {
  const { id } = useParams();
  console.log("ID:", id);
  const [administracionData, setAdministracionData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(`https://localhost:44382/administracion/getbyid?id=${id}`)
      .then((response) => {
        setAdministracionData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  const handleEditarAdministracion = (idAdministracion) => {
    console.log("Editar datos:", idAdministracion);
    const productId = idAdministracion;
    console.log("Id deproductoID:" + productId);
    const url = `/dashboards/Administracion/Edit/${productId}`;
    console.log("URL de redirección:", url);
    navigate(url);
    console.log("se paso la url");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {administracionData && (
        <>
          <Card>
            <div>
              <p className="tituloModal">Información de la Administracion</p>
              <div className="contenidoCard">
                <p>ID: {administracionData.idAdministracion}</p>
                <p>Nombre: {administracionData.nombre}</p>
                <p>Telefono: {administracionData.telefono}</p>
                <p>Email: {administracionData.email}</p>
                <p>Departamento: {administracionData.dto}</p>
              </div>
              {/* Agrega aquí más campos de acuerdo a la estructura de conservadoraData */}
            </div>
            <MDButton
              onClick={() => handleEditarAdministracion(administracionData.idAdministracion)}
            >
              Editar
            </MDButton>
          </Card>
          <MDBox mt={2}>
            {administracionData.eV_Obra.length > 0 ? (
              administracionData.eV_Obra.map((obra) => (
                <Card key={obra.idObra} className="card">
                  <p className="tituloModal">Información de Obra</p>
                  <Card>
                    <div className="contenidoCard">
                      <p>Capacidad de Carga: {obra.nombre}</p>
                      <p>Número de Serie: {obra.idCalle}</p>
                      <p>Tipo de Equipamiento: {obra.altura}</p>
                      <p>Conservadora: {obra.eV_TipoObra.descripcion}</p>
                    </div>
                    {/* Agrega aquí más información de la máquina si es necesario */}
                  </Card>
                </Card>
              ))
            ) : (
              <MDBox>
                <Card>
                  <div className="contenidoCard">
                    <p>No posee obras registradas.</p>
                  </div>
                </Card>
              </MDBox>
            )}
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}

export default AdministracionVer;
