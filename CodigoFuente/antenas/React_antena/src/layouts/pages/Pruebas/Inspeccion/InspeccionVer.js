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
function InspeccionVer() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la empresa
  const [inspeccionesData, setInspeccionesData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `ANT_Inspecciones/getbyid?id=${id}`) // Actualiza el endpoint a `ANT_Antenas`
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setInspeccionesData(response.data);
        console.log("Respuesta by ID:", inspeccionesData);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoTipo = () => {
    navigate("/InspeccionFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar empresa
  const handleEditarEmpresa = (idInspeccion) => {
    const url = `/InspeccionFE/Edit/${idInspeccion}`;
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {inspeccionesData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">{inspeccionesData?.razonSocial ?? "N/A"}</p>
              <div className="contenidoCard">
                <p>
                  <b>Apoderado: </b>
                  {inspeccionesData?.idAntena ?? "N/A"}
                </p>
                <p>
                  <b>Cuit: </b>
                  {inspeccionesData?.alambradoPerimetral ?? "N/A"}
                </p>
                <p>
                  <b>Direccion: </b>
                  {inspeccionesData?.anilloTierra ?? "N/A"}
                </p>
                <p>
                  <b>Razon Social: </b>
                  {inspeccionesData?.balizaFlash ?? "N/A"}
                </p>
                <MDButton onClick={() => handleEditarEmpresa(inspeccionesData?.idInspeccion)}>
                  Editar
                </MDButton>
              </div>
            </Card>
          </MDBox>
          <MDBox mt={2}>
            <MDButton variant="gradient" color="success" onClick={handleNuevoTipo}>
              Agregar Inspección
            </MDButton>
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}

export default InspeccionVer;
