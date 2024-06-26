import Icon from "@mui/material/Icon";
import Antena from "layouts/pages/Pruebas/Antena/index";
import Empresa from "layouts/pages/Pruebas/Empresa/index";
import Inspeccion from "layouts/pages/Pruebas/Inspeccion";
import Seguro from "layouts/pages/Pruebas/Seguro";
import EstadoTramite from "layouts/pages/Pruebas/EstadoTramite";
import EstadoInspeccion from "layouts/pages/Pruebas/EstadoInspeccion";
import Usuario from "layouts/pages/Pruebas/Usuario";
import TipoAntena from "layouts/pages/Pruebas/TipoAntena/TipoAntena";

const routes = [
  {
    type: "collapse",
    icon: <Icon>villa</Icon>,
    name: "Antena",
    key: "antena",
    collapse: [
      {
        name: "Listado Antena",
        key: "listadoAntena",
        route: "/AntenaFE",
        component: <Antena />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },

  {
    type: "collapse",
    icon: <Icon>villa</Icon>,
    name: "Empresa",
    key: "empresa",
    collapse: [
      {
        name: "Listado Empresa",
        key: "listadoEmpresa",
        route: "/EmpresaFE",
        component: <Empresa />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    icon: <Icon>villa</Icon>,
    name: "Apoderado Legal",
    key: "apoderadoLegal",
    collapse: [
      {
        name: "Apoderado Legal",
        key: "ApoderadoLegal",
        route: "/ApoderadoLegalFE",
        component: <Empresa />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    icon: <Icon>villa</Icon>,
    name: "Seguro",
    key: "seguro",
    collapse: [
      {
        name: "Seguro",
        key: "Seguro",
        route: "/SeguroFE",
        component: <Seguro />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    icon: <Icon>villa</Icon>,
    name: "Inspeccion",
    key: "inspeccion",
    collapse: [
      {
        name: "Listado Inspeccion",
        key: "listadoInspeccion",
        route: "/InspeccionFE",
        component: <Inspeccion />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    icon: <Icon>villa</Icon>,
    name: "Parametricas",
    key: "Parametricas",
    collapse: [
      {
        name: "Estado Tramite",
        key: "EstadoTramite",
        route: "/EstadoTramiteFE",
        component: <EstadoTramite />,
      },
      {
        name: "Estado Inspeccion",
        key: "EstadoInspeccion",
        route: "/EstadoInspeccionFE",
        component: <EstadoInspeccion />,
      },
      {
        name: "Usuario",
        key: "Usuario",
        route: "/UsuarioFE",
        component: <Usuario />,
      },
      {
        name: "Tipo Antena",
        key: "TipoAntena",
        route: "/TipoAntenaFE",
        component: <TipoAntena />,
      },
    ],
  },
];

export default routes;
