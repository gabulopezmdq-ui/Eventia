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
function CarRevistaVer() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la empresa
  const [carRevistaData, setCarRevistaData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `CarRevista/getbyid?id=${id}`, {
        headers: {
          //Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setCarRevistaData(response.data);
        console.log("Respuesta by ID:", carRevistaData);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoEmpresa = () => {
    navigate("/CarRevistaFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar empresa
  const handleEditarCarRevista = (idCarRevista) => {
    const url = `/CarRevistaFE/Edit/${idCarRevista}`;
    console.log(url);
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {carRevistaData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">{"N/A"}</p>
              <div className="contenidoCard">
                <p>
                  <b>Cod. Provincia: </b>
                  {carRevistaData?.codPcia ?? "N/A"}
                </p>
                <p>
                  <b>Descripcion: </b>
                  {carRevistaData?.descripcion ?? "N/A"}
                </p>
                <p>
                  <b>Cod. MGP: </b>
                  {carRevistaData?.codMgp ?? "N/A"}
                </p>
                <p>
                  <b>Vigente: </b>
                  {carRevistaData?.vigente === "S"
                    ? "SI"
                    : carRevistaData?.vigente === "N"
                    ? "NO"
                    : "N/A"}
                </p>
                <MDButton onClick={() => handleEditarCarRevista(carRevistaData?.idCarRevista)}>
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

export default CarRevistaVer;
