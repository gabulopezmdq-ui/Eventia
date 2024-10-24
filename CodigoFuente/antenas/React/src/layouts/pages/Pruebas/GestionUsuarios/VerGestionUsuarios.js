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
function VerGestionUsuarios() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la empresa
  const [idUsuarioData, setidUsuarioData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `Usuarios/getbyid?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setidUsuarioData(response.data);
        console.log("Respuesta by ID:", idUsuarioData);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoEmpresa = () => {
    navigate("/VerGestionUsuariosFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar
  const handleEditaridUsuario = (idUsuario) => {
    const url = `/VerGestionUsuariosFE/Edit/${idUsuario}`;
    console.log(url);
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {idUsuarioData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">{"Gestion de usuarios"}</p>
              <div className="contenidoCard">
                <p>
                  <b>Nombre: </b>
                  {idUsuarioData?.nombre ?? "N/A"}
                </p>
                <p>
                  <b>Email: </b>
                  {idUsuarioData?.email ?? "N/A"}
                </p>
                <p>
                  <b>activo: </b>
                  {idUsuarioData?.activo ?? "N/A"}
                </p>
                <MDButton onClick={() => handleEditaridUsuario(idUsuarioData?.idUsuario)}>
                  Editar
                </MDButton>
              </div>
            </Card>
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}

export default VerGestionUsuarios;
