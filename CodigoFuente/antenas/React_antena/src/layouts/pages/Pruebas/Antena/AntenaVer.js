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
function AntenaVer() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la antena
  const [antenaData, setAntenaData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `ANT_Antenas/getbyid?id=${id}`) // Actualiza el endpoint a `ANT_Antenas`
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setAntenaData(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoTipo = () => {
    navigate("/AntenaFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar antena
  const handleEditarAntena = (idAntena) => {
    const productId = idAntena;
    const url = `/AntenaFE/Edit/${productId}`;
    console.log(url);
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {antenaData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">Información</p>
              <div className="contenidoCard">
                <p>
                  <b>ID: </b>
                  {antenaData?.idAntena ?? "N/A"}
                </p>
                <p>
                  <b>Altura Soporte: </b>
                  {antenaData?.alturaSoporte ?? "N/A"}
                </p>
                <p>
                  <b>Altura Total: </b>
                  {antenaData?.alturaTotal ?? "N/A"}
                </p>
                <p>
                  <b>Cell ID: </b>
                  {antenaData?.cellId ?? "N/A"}
                </p>
                <p>
                  <b>Código Sitio: </b>
                  {antenaData?.codigoSitio ?? "N/A"}
                </p>
                <p>
                  <b>Declarada: </b>
                  {antenaData?.declarada ?? "N/A"}
                </p>
                <p>
                  <b>Dirección: </b>
                  {antenaData?.direccion ?? "N/A"}
                </p>
                <p>
                  <b>Emplazamiento: </b>
                  {antenaData?.emplazamiento ?? "N/A"}
                </p>
                <p>
                  <b>Observaciones: </b>
                  {antenaData?.observaciones ?? "N/A"}
                </p>
                <p>
                  <b>Sala de Equipos: </b>
                  {antenaData?.salaEquipos ?? "N/A"}
                </p>
                <p>
                  <b>Tipo Mimetizado: </b>
                  {antenaData?.tipoMimetizado ?? "N/A"}
                </p>
                <p>
                  <b>Expediente - Acometida Energía: </b>
                  {antenaData?.expediente?.acometidaEnergia ?? "N/A"}
                </p>
                <p>
                  <b>Expediente - Acta Asamblea: </b>
                  {antenaData?.expediente?.actaAsamblea ?? "N/A"}
                </p>
                <MDButton onClick={() => handleEditarAntena(antenaData?.idAntena)}>Editar</MDButton>
              </div>
            </Card>
          </MDBox>
          <MDBox mt={2}>
            <MDButton variant="gradient" color="success" onClick={handleNuevoTipo}>
              Agregar Antena
            </MDButton>
          </MDBox>
        </>
      )}
    </DashboardLayout>
  );
}

export default AntenaVer;
