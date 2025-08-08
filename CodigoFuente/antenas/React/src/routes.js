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
import PlantaFuncionalSec from "layouts/pages/Pruebas/PlantaFuncional/SecretarioPlantaFuncional";
import RevertirImportacion from "layouts/pages/Pruebas/RevertirImportacion/index";
import ConsolidarMecPof from "layouts/pages/Pruebas/ConsolidarMecPof";
import ProcesarArchivoImportado from "layouts/pages/Pruebas/ProcesarArchivoImportado";
import UsuariosEstablecimientos from "layouts/pages/Pruebas/UsuariosEstablecimientos/Index";
import ListadoMotivosBajas from "layouts/pages/Pruebas/MotivoBaja/index";
import ListadoTiposMovimientos from "layouts/pages/Pruebas/TiposMovimientos/index";
import Bajas from "layouts/pages/Pruebas/Bajas";
import CabeceraMovimientos from "layouts/pages/Pruebas/Movimientos/CabeceraMovimientos";
import CargarInasistencia from "layouts/pages/Pruebas/Inasistencias/CargarInasistencia/index";

const routes = [
  {
    type: "collapse",
    icon: <Icon>account_balance_wallet</Icon>,
    name: "Liquidaciones",
    key: "liquidaciones",
    roles: ["admin", "superadmin"],
    collapse: [
      {
        name: "Cabecera Liquidacion",
        key: "cabeceraLiquidacion",
        route: "/CabeceraLiquidacionFE",
        component: <CabeceraLiquidacion />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Importar Archivo Plano",
        key: "ImportarArchivoPlano",
        route: "/ImportarArchivoPlanoFE",
        component: <ImportarArchivo />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Revertir Importación",
        key: "RevertirImportacion",
        route: "/RevertirImportacionFE",
        component: <RevertirImportacion />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Procesar Archivo Importado",
        key: "ProcesarArchivoImportado",
        route: "/ProcesarArchivoImportadoFE",
        component: <ProcesarArchivoImportado />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Consolidar Mec Pof",
        key: "ConsolidarMecPof",
        route: "/ConsolidarMecPofFE",
        component: <ConsolidarMecPof />,
        roles: ["admin", "superadmin"],
      },
    ],
  },
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    icon: <Icon>person</Icon>,
    name: "POF",
    key: "pof",
    roles: ["admin", "superadmin", "secretario"],
    collapse: [
      {
        name: "Gestión de Personas",
        key: "listadoPersona",
        route: "/PersonaFE",
        component: <PersonaListados />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Planta Funcional",
        key: "plantaFuncional",
        route: "/PlantaFuncionalFE",
        component: <PlantaFuncional />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Planta Funcional",
        key: "plantaFuncionalsecretario",
        route: "/PlantaFuncionalSec",
        component: <PlantaFuncionalSec />,
        roles: ["secretario"],
      },
    ],
  },
  { type: "divider", key: "divider-3" },
  {
    type: "collapse",
    icon: <Icon>sync_alt</Icon>,
    name: "Movimientos",
    key: "movimientos",
    roles: ["admin", "superadmin", "secretario"],
    collapse: [
      {
        name: "Cabeceras Movimientos",
        key: "cabecerasMovimientos",
        route: "/CabeceraMovimientos",
        component: <CabeceraMovimientos />,
        roles: ["admin", "superadmin", "secretario"],
      },
    ],
  },
  { type: "divider", key: "divider-4" },
  {
    type: "collapse",
    icon: <Icon>assignmentIcon</Icon>,
    name: "Inasistencia",
    key: "inasistencia",
    roles: ["admin", "superadmin"],
    collapse: [
      {
        name: "Cargar Inasistencia",
        key: "cargarInasistencia",
        route: "/CargarInasistencia",
        component: <CargarInasistencia />,
        roles: ["admin", "superadmin"],
      },
    ],
  },
  { type: "divider", key: "divider-1" },
  {
    type: "collapse",
    icon: <Icon>security</Icon>,
    name: "Seguridad",
    key: "Seguridad",
    roles: ["admin", "superadmin"],
    collapse: [
      {
        name: "Gestion de Usuario",
        key: "GestionUsuarios",
        route: "/GestionUsuariosFE",
        component: <GestionUsuario />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Usuario Por Rol",
        key: "UsuariosPorRol",
        route: "/UsuariosPorRolFE",
        component: <UsuarioPorRol />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Usuarios por Establecimientos",
        key: "UsuariosEstablecimientos",
        route: "/UsuariosEstablecimientosFE",
        component: <UsuariosEstablecimientos />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Bajas",
        key: "Bajas",
        route: "/BajasFE",
        component: <Bajas />,
        roles: ["admin", "superadmin"],
      },
    ],
  },
  { type: "divider", key: "divider-2" },
  {
    type: "collapse",
    icon: <Icon>book</Icon>,
    name: "Parámetricas",
    key: "parametricas",
    roles: ["admin", "superadmin"],
    collapse: [
      {
        name: "Conceptos",
        key: "ListadoConceptos",
        route: "/ConceptosFE",
        component: <ListadoConceptos />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Caracteres de Revista",
        key: "CarRevista",
        route: "/CarRevistaFE",
        component: <ListadoCarRevista />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Tipos de Establecimientos",
        key: "ListadoTipoEstablecimiento",
        route: "/TipoEstablecimientoFE",
        component: <ListadoTipoEstablecimiento />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Establecimientos",
        key: "Establecimiento",
        route: "/EstablecimientoFE",
        component: <Establecimiento />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Tipos de Funciones",
        key: "TiposFunciones",
        route: "/TiposFuncionesFE",
        component: <TiposFunciones />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Tipos de Liquidaciones",
        key: "TipoLiquidaciones",
        route: "/TipoLiquidacionesFE",
        component: <TipoLiquidaciones />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Tipos de Categorias",
        key: "TipoCategorias",
        route: "/TipoCategoriasFE",
        component: <TipoCategorias />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Motivos de Baja",
        key: "MotivoBaja",
        route: "/MotivoBajaFE",
        component: <ListadoMotivosBajas />,
        roles: ["admin", "superadmin"],
      },
      {
        name: "Tipo de Movimientos",
        key: "TipoMovimiento",
        route: "/TipoMovimientoFE",
        component: <ListadoTiposMovimientos />,
        roles: ["admin", "superadmin"],
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
