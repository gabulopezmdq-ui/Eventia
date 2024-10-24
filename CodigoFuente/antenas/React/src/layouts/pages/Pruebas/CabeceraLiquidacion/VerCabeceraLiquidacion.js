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
function VerCabeceraLiquidacion() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la empresa
  const [idCabeceraData, setidCabeceraData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `CabeceraLiquidacion/getbyid?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setidCabeceraData(response.data);
        console.log("Respuesta by ID:", idCabeceraData);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoEmpresa = () => {
    navigate("/VerCabeceraLiquidacionFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar
  const handleEditaridCabecera = (idCabecera) => {
    const url = `/VerCabeceraLiquidacionFE/Edit/${idCabecera}`;
    console.log(url);
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {idCabeceraData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">{"Detalles de la liquidación"}</p>
              <div className="contenidoCard">
                <p>
                  <b>Tipo de Liquidacion: </b>
                  {idCabeceraData?.tipoLiquidacion?.descripcion ?? "N/A"}
                </p>
                <p>
                  <b>Inicio Liquidacion: </b>
                  {idCabeceraData?.inicioLiquidacion ?? "N/A"}
                </p>
                <p>
                  <b>fin Liquidacion: </b>
                  {idCabeceraData?.finLiquidacion ?? "N/A"}
                </p>
                <p>
                  <b>Estado: </b>
                  {idCabeceraData?.estado ?? "N/A"}
                </p>
                <p>
                  <b>Vigente: </b>
                  {idCabeceraData?.vigente === "S"
                    ? "SI"
                    : idCabeceraData?.vigente === "N"
                    ? "NO"
                    : "N/A"}
                </p>
                <MDButton onClick={() => handleEditaridCabecera(idCabeceraData?.idCabecera)}>
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

export default VerCabeceraLiquidacion;
