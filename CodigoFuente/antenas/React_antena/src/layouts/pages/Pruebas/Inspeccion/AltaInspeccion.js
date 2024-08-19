import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Formulario from "components/Formulario";

function AltaInspeccion() {
  const { id } = useParams();
  let labelTitulo = "Alta Inspeccion";
  if (id) {
    labelTitulo = "Editar Inspeccion";
  }
  const steps = [
    {
      label: "Info General",
      fields: [
        {
          type: "select",
          label: "Identificador de la antena",
          name: "idAntena",
          apiUrl: process.env.REACT_APP_API_URL + "ANT_Antenas/GetAll",
          valueField: "idAntena", // revisar.............................
          optionField: "idAntena",
          required: true,
        },
        /*{
          type: "select",
          label: "Número expediente",
          name: "idExpediente",
          apiUrl: process.env.REACT_APP_API_URL + "ANT_Expedientes/GetAll",
          valueField: "idExpediente", // revisar.............................
          optionField: "idExpediente",
          required: true,
        },*/
        /*{
          type: "select",
          label: "Usuario",
          name: "idUsuario",
          apiUrl: process.env.REACT_APP_API_URL + "ANT_Usuarios/GetAll",
          valueField: "idUsuario", // revisar.............................
          optionField: "idUsuario",
          required: true,
        },*/
        { type: "text", label: "idUsuario", name: "idUsuario" },
        { type: "text", label: "Alambrado Perimetral", name: "alambradoPerimetral" },
        { type: "text", label: "Anillo Tierra", name: "anilloTierra" },
        { type: "text", label: "Baliza Flash", name: "balizaFlash" },
        { type: "text", label: "Barra Equipos", name: "barraEquipos" },
        { type: "text", label: "Barra Estructura", name: "barraEstructura" },
      ],
    },
    /*-----------------------------------------------------------------------------*/
    {
      label: "Inspección visual",
      fields: [
        { type: "text", label: "Base Concreto", name: "baseConcreto" },
        { type: "text", label: "Base Concreto Prin", name: "baseConcretoPrin" },
        { type: "text", label: "Bulones", name: "bulones" },
        { type: "text", label: "Cable Alimentacion", name: "cableAlimentacion" },
        { type: "text", label: "Cable Descarga", name: "cableDescarga" },
        { type: "text", label: "Camara Inspeccion", name: "camaraInspeccion" },
        { type: "text", label: "Camara Pararrayos", name: "camaraPararrayos" },
        { type: "text", label: "Camaras Inspección", name: "camarasInspec" },
        { type: "text", label: "Camaras Pase", name: "camarasPase" },
        { type: "text", label: "Canal Pilar", name: "canalPilar" },
        { type: "text", label: "Conexion Barra", name: "conexionBarra" },
        { type: "text", label: "Conexion Chasis", name: "conexionChasis" },
      ],
    },
    /*---------------------------------------------------------------------------------------------*/
    {
      label: "Banquina de equipos",
      fields: [
        { type: "text", label: "Conexion estado nillo", name: "conexionEstAnillo" },
        { type: "text", label: "Conexion Tierra", name: "conexionTierra" },
        { type: "text", label: "Desmalezado", name: "desmalezado" },
        { type: "text", label: "Despla Fisuras", name: "desplaFisuras" },
        { type: "text", label: "Erosion Terreno", name: "erosionTerreno" },
        { type: "text", label: "Escalera Guarda", name: "escaleraGuarda" },
        { type: "text", label: "Estado Fotocelula", name: "estadoFotocelula" },
        { type: "text", label: "Estado General", name: "estadoGral" },
        { type: "text", label: "Estanque Cañerias", name: "estanqueCañerias" },
        { type: "text", label: "Estr Transicion", name: "estrTransicion" },
        { type: "date", label: "Fecha", name: "fecha" },
      ],
    },
    /*---------------------------------------------------------------------------------*/
    {
      label: "Equipos Shelter",
      fields: [
        { type: "text", label: "Grasa Antiox", name: "grasaAntiox" },
        { type: "text", label: "Grietas", name: "grietas" },
        { type: "text", label: "Iluminacion Banquina", name: "iluminacionBanquina" },
        { type: "text", label: "Luces Baliza", name: "lucesBaliza" },
        { type: "text", label: "Mastil", name: "mastil" },
        { type: "text", label: "Objetos Extraños", name: "objetosExtraños" },
        { type: "text", label: "Observaciones", name: "observaciones" },
        { type: "text", label: "Obstrucciones Caños", name: "obstruccionesCaños" },
        { type: "text", label: "Pedestal Concreto", name: "pedestalConcreto" },
        { type: "text", label: "Pernos Fija Estructura", name: "pernosFijaEstructura" },
        { type: "text", label: "Pernos Fija Gabinetes", name: "pernosFijaGabinetes" },
        { type: "text", label: "Pernos Fija Pedestales", name: "pernosFijaPedestales" },
        { type: "text", label: "Pernos Fijav Perfil", name: "pernosFijaPerfil" },
        { type: "text", label: "Pernos Viga", name: "pernosViga" },
        { type: "text", label: "Pilar Medicion", name: "pilarMedicion" },
        { type: "text", label: "Pintura Baliza", name: "pinturaBaliza" },
      ],
    },
    {
      label: "Ultimo",
      fields: [
        { type: "text", label: "Pintura Banquina", name: "pinturaBanquina" },
        { type: "text", label: "Plata formas Inspeccion", name: "plataformasInspeccion" },
        { type: "text", label: "Porto Acceso", name: "portoAcceso" },
        { type: "text", label: "Proteccion Termo", name: "proteccionTermo" },
        { type: "text", label: "Puerta Banquina", name: "puertaBanquina" },
        { type: "text", label: "Punta Captora", name: "puntaCaptora" },
        { type: "text", label: "Puntos Humedad", name: "puntosHumedad" },
        { type: "text", label: "Razon", name: "razon" },
        { type: "text", label: "Rotura Pedestales", name: "roturaPedestales" },
        { type: "text", label: "SalvaCaidas", name: "salvaCaidas" },
        { type: "text", label: "Simbolo Riesgo Electrico", name: "simboloRiesgoElec" },
        { type: "text", label: "Soporte Balizas", name: "soporteBalizas" },
        { type: "text", label: "Soportes Bandejas", name: "soportesBandejas" },
        { type: "text", label: "Soportes Cañerias", name: "soportesCañerias" },
        { type: "text", label: "Soportes Fijaciones", name: "soportesFijaciones" },
        { type: "text", label: "Tablero Baliza", name: "tableroBaliza" },
      ],
    },
    {
      label: "Ultimo",
      fields: [
        { type: "text", label: "Tablero Emergencia", name: "tableroEmergencia" },
        { type: "text", label: "Tablero Gral CA", name: "tableroGralCA" },
        { type: "text", label: "Tablero Principal", name: "tableroPrincipal" },
        { type: "text", label: "Ucla", name: "ucla" },
        { type: "text", label: "Uniones Tramos", name: "unionesTramos" },
        { type: "text", label: "Verticalidad", name: "verticalidad" },
        { type: "text", label: "Viga Equipos", name: "vigaEquipos" },
        { type: "text", label: "Visibilidad", name: "visibilidad" },
      ],
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL + `ANT_Inspecciones`;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20} height="65vh">
        <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%", mt: 8 }}>
          <Grid item xs={12} lg={10}>
            <Formulario steps={steps} apiUrl={apiUrl} productId={id} />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AltaInspeccion;
