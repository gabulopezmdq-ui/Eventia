/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 PRO React layouts
import ProfileOverview from "layouts/pages/profile/profile-overview";
import Settings from "layouts/pages/account/settings";
import SignInBasic from "layouts/authentication/sign-in/basic";
// Material Dashboard 2 PRO React components
import MDAvatar from "components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import PersonaListados from "layouts/pages/Pruebas/Persona";
import ListadoCarRevista from "layouts/pages/Pruebas/CarRevista/index";
import ListadoTipoEstablecimiento from "layouts/pages/Pruebas/TipoEstablecimiento";
import ListadoConceptos from "layouts/pages/Pruebas/Conceptos";
import Importar from "layouts/pages/Pruebas/Importar";
import CabeceraLiquidacion from "layouts/pages/Pruebas/CabeceraLiquidacion";
import ImportarArchivo from "layouts/pages/Pruebas/ImportarArchivoPlano";
import GestionUsuario from "layouts/pages/Pruebas/GestionUsuarios";
import UsuarioPorRol from "layouts/pages/Pruebas/UsuariosPorRol";
import Establecimientos from "layouts/pages/Pruebas/Establecimientos";
import TiposFunciones from "layouts/pages/Pruebas/TiposFunciones";
import TipoLiquidaciones from "layouts/pages/Pruebas/TipoLiquidaciones";
import TipoCategorias from "layouts/pages/Pruebas/TipoCategorias";

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
        name: "Listado Conceptos",
        key: "ListadoConceptos",
        route: "/ConceptosFE",
        component: <ListadoConceptos />,
      },
      {
        name: "Caracteres Revista",
        key: "CarRevista",
        route: "/CarRevistaFE",
        component: <ListadoCarRevista />,
      },
      {
        name: "Tipo Establecimiento",
        key: "ListadoTipoEstablecimiento",
        route: "/TipoEstablecimientoFE",
        component: <ListadoTipoEstablecimiento />,
      },
      {
        name: "Establecimientos",
        key: "Establecimientos",
        route: "/EstablecimientosFE",
        component: <Establecimientos />,
      },
      {
        name: "Tipos de Funciones",
        key: "TiposFunciones",
        route: "/TiposFuncionesFE",
        component: <TiposFunciones />,
      },
      {
        name: "Tipo Liquidaciones",
        key: "TipoLiquidaciones",
        route: "/TipoLiquidacionesFE",
        component: <TipoLiquidaciones />,
      },
      {
        name: "Tipo Categorias",
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
