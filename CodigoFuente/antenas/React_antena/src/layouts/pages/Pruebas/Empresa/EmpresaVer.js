// Importar componentes y librerías necesarias
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";

// Función principal del componente
function EmpresaVer() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la empresa
  const [prestadoresData, setPrestadoresData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `ANT_Prestadores/getbyid?id=${id}`) // Actualiza el endpoint a `ANT_Antenas`
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setPrestadoresData(response.data);
        console.log("Respuesta by ID:", prestadoresData);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoEmpresa = () => {
    navigate("/EmpresaFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar empresa
  const handleEditarEmpresa = (idPrestador) => {
    const url = `/EmpresaFE/Edit/${idPrestador}`;
    console.log(url);
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {prestadoresData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">Empresa: {prestadoresData?.razonSocial ?? "N/A"}</p>
              <div className="contenidoCard">
                <p>
                  <b>Apoderado: </b>
                  {prestadoresData?.idApoderado ?? "N/A"}
                </p>
                <p>
                  <b>Cuit: </b>
                  {prestadoresData?.cuit ?? "N/A"}
                </p>
                <p>
                  <b>Direccion: </b>
                  {prestadoresData?.direccion ?? "N/A"}
                </p>
                <p>
                  <b>Razon Social: </b>
                  {prestadoresData?.razonSocial ?? "N/A"}
                </p>
                <MDButton onClick={() => handleEditarEmpresa(prestadoresData?.idPrestador)}>
                  Editar
                </MDButton>
              </div>
            </Card>
          </MDBox>
          <MDBox mt={2}>
            <MDButton variant="gradient" color="success" onClick={handleNuevoEmpresa}>
              Agregar Inspección
            </MDButton>
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}

export default EmpresaVer;
