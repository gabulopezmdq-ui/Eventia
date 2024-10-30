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
function VerEstablecimiento() {
  // Obtener el ID desde los parámetros de la URL
  const { id } = useParams();
  // Estado para almacenar los datos de la empresa
  const [idEstablecimientoData, setidEstablecimientoData] = useState(null);
  // Hook de navegación para redirigir a otras páginas
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // useEffect para realizar la petición GET al servidor cuando el ID cambie
  useEffect(() => {
    // Realizar la petición GET al servidor
    axios
      .get(process.env.REACT_APP_API_URL + `Establecimientos/getbyid?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
      })
      .then((response) => {
        // Guardar los datos recibidos en el estado
        setidEstablecimientoData(response.data);
        console.log("Respuesta by ID:", idEstablecimientoData);
      })
      .catch((error) => {
        console.error("Error al obtener los datos:", error);
      });
  }, [id]);

  // Función para manejar la navegación a la página de crear nueva inspección (o cualquier otra funcionalidad)
  const handleNuevoEstablecimiento = () => {
    navigate("/VerEstablecimientoFE/Nuevo");
  };

  // Función para manejar la navegación a la página de editar
  const handleEditarEstablecimiento = (idEstablecimiento) => {
    const url = `/EstablecimientoFE/Edit/${idEstablecimiento}`;
    console.log(url);
    navigate(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {idEstablecimientoData && (
        <>
          <MDBox>
            <Card>
              <p className="tituloModal">{"Conceptos"}</p>
              <div className="contenidoCard">
                <p>
                  <b>nombre Provincia: </b>
                  {idEstablecimientoData?.nombrePcia ?? "N/A"}
                </p>
                <p>
                  <b>Domicilio: </b>
                  {idEstablecimientoData?.domicilio ?? "N/A"}
                </p>
                <p>
                  <b>Telefono: </b>
                  {idEstablecimientoData?.telefono ?? "N/A"}
                </p>
                <p>
                  <b>UE: </b>
                  {idEstablecimientoData?.ue ?? "N/A"}
                </p>
                <p>
                  <b>CantSecciones: </b>
                  {idEstablecimientoData?.cantSecciones ?? "N/A"}
                </p>
                <p>
                  <b>CantTurnos: </b>
                  {idEstablecimientoData?.cantTurnos ?? "N/A"}
                </p>
                <p>
                  <b>Ruralidad: </b>
                  {idEstablecimientoData?.ruralidad ?? "N/A"}
                </p>
                <p>
                  <b>Subvencion: </b>
                  {idEstablecimientoData?.subvencion ?? "N/A"}
                </p>
                {/*<p>
                  <b>Vigente: </b>
                  {idEstablecimientoData?.vigente === "S"
                    ? "SI"
                    : idEstablecimientoData?.vigente === "N"
                    ? "NO"
                    : "N/A"}
                </p>*/}
                <MDButton
                  onClick={() =>
                    handleEditarEstablecimiento(idEstablecimientoData?.idEstablecimiento)
                  }
                >
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

export default VerEstablecimiento;
