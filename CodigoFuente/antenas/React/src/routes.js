import Icon from "@mui/material/Icon";
import PersonaListados from "layouts/pages/Pruebas/Persona";
import ListadoCarRevista from "layouts/pages/Pruebas/CarRevista/index";
import ListadoTipoEstablecimiento from "layouts/pages/Pruebas/TipoEstablecimiento";
import ListadoConceptos from "layouts/pages/Pruebas/Conceptos";
import Importar from "layouts/pages/Pruebas/Importar";
import CabeceraLiquidacion from "layouts/pages/Pruebas/CabeceraLiquidacion";
import ImportarArchivo from "layouts/pages/Pruebas/ImportarArchivoPlano";
import GestionUsuario from "layouts/pages/Pruebas/GestionUsuarios";
import UsuarioPorRol from "layouts/pages/Pruebas/UsuariosPorRol";
import Establecimiento from "layouts/pages/Pruebas/Establecimiento";
import TiposFunciones from "layouts/pages/Pruebas/TiposFunciones";
import TipoLiquidaciones from "layouts/pages/Pruebas/TipoLiquidaciones";
import TipoCategorias from "layouts/pages/Pruebas/TipoCategorias";
import PlantaFuncional from "layouts/pages/Pruebas/PlantaFuncional";

const routes = [
  {
    type: "collapse",
    icon: <Icon>account_balance_wallet</Icon>,
    name: "Liquidaciones",
    key: "liquidaciones",
    collapse: [
      {
        name: "Cabecera Liquidacion",
        key: "cabeceraLiquidacion",
        route: "/CabeceraLiquidacionFE",
        component: <CabeceraLiquidacion />,
      },
      {
        name: "Importar Archivo Plano",
        key: "ImportarArchivoPlano",
        route: "/ImportarArchivoPlanoFE",
        component: <ImportarArchivo />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    icon: <Icon>person</Icon>,
    name: "POF",
    key: "pof",
    collapse: [
      {
        name: "Gestion de Persona",
        key: "listadoPersona",
        route: "/PersonaFE",
        component: <PersonaListados />,
      },
      {
        name: "Planta Funcional",
        key: "plantaFuncional",
        route: "/PlantaFuncionalFE",
        component: <PlantaFuncional />,
      },
    ],
  },
  { type: "divider", key: "divider-1" },
  {
    type: "collapse",
    icon: <Icon>security</Icon>,
    name: "Seguridad",
    key: "Seguridad",
    collapse: [
      {
        name: "Gestion de Usuario",
        key: "GestionUsuarios",
        route: "/GestionUsuariosFE",
        component: <GestionUsuario />,
      },
      {
        name: "Usuario Por Rol",
        key: "UsuariosPorRol",
        route: "/UsuariosPorRolFE",
        component: <UsuarioPorRol />,
      },
    ],
  },
  { type: "divider", key: "divider-2" },
  {
    type: "collapse",
    icon: <Icon>book</Icon>,
    name: "Parámetricas",
    key: "parametricas",
    collapse: [
      {
        name: "Conceptos",
        key: "ListadoConceptos",
        route: "/ConceptosFE",
        component: <ListadoConceptos />,
      },
      {
        name: "Caracteres de Revista",
        key: "CarRevista",
        route: "/CarRevistaFE",
        component: <ListadoCarRevista />,
      },
      {
        name: "Tipos de Establecimientos",
        key: "ListadoTipoEstablecimiento",
        route: "/TipoEstablecimientoFE",
        component: <ListadoTipoEstablecimiento />,
      },
      {
        name: "Establecimientos",
        key: "Establecimiento",
        route: "/EstablecimientoFE",
        component: <Establecimiento />,
      },
      {
        name: "Tipos de Funciones",
        key: "TiposFunciones",
        route: "/TiposFuncionesFE",
        component: <TiposFunciones />,
      },
      {
        name: "Tipos de Liquidaciones",
        key: "TipoLiquidaciones",
        route: "/TipoLiquidacionesFE",
        component: <TipoLiquidaciones />,
      },
      {
        name: "Tipos de Categorias",
        key: "TipoCategorias",
        route: "/TipoCategoriasFE",
        component: <TipoCategorias />,
      },
      /*{
        name: "Importar",
        key: "Importar",
        route: "/ImportarFE",
        component: <Importar />,
      },*/
    ],
  },
];

export default routes;
