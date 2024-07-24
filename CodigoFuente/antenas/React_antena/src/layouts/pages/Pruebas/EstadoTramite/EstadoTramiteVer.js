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
function EstadoTramiteVer() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la empresa
  const [apoderadosData, setApoderadosData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `ANT_EstadoTramite/getbyid?id=${id}`) // Actualiza el endpoint a `ANT_Antenas`
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setApoderadosData(response.data);
        console.log("Respuesta by ID:", apoderadosData);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoEstadoTramite = () => {
    navigate("/EstadoTramiteFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar empresa
  const handleEditarEstadoTramite = (idEstado) => {
    const productId = idEstado;
    const url = `/EstadoTramiteFE/Edit/${productId}`;
    console.log(url);
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {apoderadosData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">{apoderadosData?.razonSocial ?? "N/A"}</p>
              <div className="contenidoCard">
                <p>
                  <b>Estado: </b>
                  {apoderadosData?.estado ?? "N/A"}
                </p>
                <MDButton onClick={() => handleEditarEstadoTramite(apoderadosData?.idEstado)}>
                  Editar
                </MDButton>
              </div>
            </Card>
          </MDBox>
          <MDBox mt={2}>
            <MDButton variant="gradient" color="success" onClick={handleNuevoEstadoTramite}>
              Agregar Inspección
            </MDButton>
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}

export default EstadoTramiteVer;
