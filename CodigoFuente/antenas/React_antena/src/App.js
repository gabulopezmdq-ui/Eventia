import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import jwt_decode from "jwt-decode";
import SignInBasic from "../src/layouts/authentication/sign-in/basic/index";
import AltaAntena from "layouts/pages/Pruebas/Antena/AltaAntena";
import AntenaVer from "layouts/pages/Pruebas/Antena/AntenaVer";
import Antena from "layouts/pages/Pruebas/Antena";
import Empresa from "layouts/pages/Pruebas/Empresa";
import Inspeccion from "layouts/pages/Pruebas/Inspeccion";
import AltaInspeccion from "layouts/pages/Pruebas/Inspeccion/AltaInspeccion";
import ApoderadoLegal from "layouts/pages/Pruebas/ApoderadoLegal";
import Seguro from "layouts/pages/Pruebas/Seguro";
import EstadoTramite from "layouts/pages/Pruebas/EstadoTramite";
import Usuario from "layouts/pages/Pruebas/Usuario";
import TipoAntena from "layouts/pages/Pruebas/TipoAntena/Index";
import AltaEmpresa from "layouts/pages/Pruebas/Empresa/AltaEmpresa";
import AltaApoderado from "layouts/pages/Pruebas/ApoderadoLegal/AltaApoderado";
import Expediente from "layouts/pages/Pruebas/Expediente";
import EmpresaVer from "layouts/pages/Pruebas/Empresa/EmpresaVer";
import InspeccionVer from "layouts/pages/Pruebas/Inspeccion/InspeccionVer";
import ExpedienteVer from "layouts/pages/Pruebas/Expediente/ExpedienteVer";
import AltaTipoAntena from "layouts/pages/Pruebas/TipoAntena/AltaTipoAntena";
import AltaEstadoTramite from "layouts/pages/Pruebas/EstadoTramite/AltaEstadoTramite";
import AltaExpediente from "layouts/pages/Pruebas/Expediente/AltaExpediente";
import ApoderadoVer from "layouts/pages/Pruebas/ApoderadoLegal/ApoderadoVer";
import EstadoTramiteVer from "layouts/pages/Pruebas/EstadoTramite/EstadoTramiteVer";
import TipoAntenaVer from "layouts/pages/Pruebas/TipoAntena/TipoAntenaVer";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();

  //Validacion Token
  const isTokenExpired = (token) => {
    const decodedToken = jwt_decode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decodedToken.exp;
    return expirationTime < currentTime;
  };

  const isTokenAvailable = () => {
    const token = sessionStorage.getItem("token");
    /*if (!token || isTokenExpired(token)) {
      sessionStorage.removeItem("token");
      return false;
    }*/
    return true;
  };

  useEffect(() => {
    const storageEventListener = (event) => {
      if (event.storageArea === sessionStorage && event.key === "token") {
        if (!isTokenAvailable()) {
          window.location.href = "/authentication/sign-in/basic";
        }
      }
    };

    window.addEventListener("storage", storageEventListener);

    return () => {
      window.removeEventListener("storage", storageEventListener);
    };
  }, []);

  useEffect(() => {
    const storageEventListener = (event) => {
      if (event.storageArea === sessionStorage && event.key === "token") {
        const token = sessionStorage.getItem("token");
        if (!token || isTokenExpired(token)) {
          console.log("Token expirado.");
          sessionStorage.removeItem("token");
          window.location.href = "/authentication/sign-in/basic";
        }
      }
    };

    const isTokenExpired = (token, subtractSeconds = 3600) => {
      const decodedToken = jwt_decode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Convertir a segundos y redondear hacia abajo
      const expirationTime = decodedToken.exp - subtractSeconds;
      return expirationTime < currentTime;
    };

    window.addEventListener("storage", storageEventListener);

    return () => {
      console.log("Removing storage event listener.");
      window.removeEventListener("storage", storageEventListener);
    };
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }
      return null;
    });

  const RoutesProtegidas = [
    //------------------------Rutas de Alta-------------------------------------------------
    {
      path: "/AntenaFE/Nuevo",
      component: AltaAntena,
    },
    {
      path: "/InspeccionFE/Nuevo",
      component: AltaInspeccion,
    },
    {
      path: "/EmpresaFE/Nuevo",
      component: AltaEmpresa,
    },
    {
      path: "/ApoderadoFE/Nuevo",
      component: AltaApoderado,
    },
    {
      path: "/TipoAntenaFE/Nuevo",
      component: AltaTipoAntena,
    },
    {
      path: "/EstadoTramiteFE/Nuevo",
      component: AltaEstadoTramite,
    },
    {
      path: "/ExpedienteFE/Nuevo",
      component: AltaExpediente,
    },
    //-----------------------------Rutas de Listado-----------------------------------------
    {
      path: "/AntenaFE/",
      component: Antena,
    },
    {
      path: "/EmpresaFE/",
      component: Empresa,
    },
    {
      path: "/ApoderadoLegalFE/",
      component: ApoderadoLegal,
    },
    {
      path: "/SeguroFE",
      component: Seguro,
    },
    {
      path: "/InspeccionFE",
      component: Inspeccion,
    },
    {
      path: "/EstadoTramiteFE",
      component: EstadoTramite,
    },
    {
      path: "/UsuarioFE",
      component: Usuario,
    },
    {
      path: "/TipoAntenaFE",
      component: TipoAntena,
    },
    {
      path: "/ExpedienteFE",
      component: Expediente,
    },
    //-----------------------------Rutas de Vermas ?? ----------------------------------------
    {
      path: "/AntenaFE/:id",
      component: AntenaVer,
    },
    {
      path: "/EmpresaFE/:id",
      component: EmpresaVer,
    },
    {
      path: "/InspeccionFE/:id",
      component: InspeccionVer,
    },
    {
      path: "/ExpedienteFE/:id",
      component: ExpedienteVer,
    },
    {
      path: "/ApoderadoFE/:id",
      component: ApoderadoVer,
    },
    {
      path: "/EstadoTramiteFE/:id",
      component: EstadoTramiteVer,
    },
    {
      path: "/TipoAntenaFE/:id",
      component: TipoAntenaVer,
    },
    //-----------------------------Rutas de Editar ?? ----------------------------------------
    {
      path: "/AntenaFE/Edit/:id",
      component: AltaAntena,
    },
    {
      path: "/EmpresaFE/Edit/:id",
      component: AltaEmpresa,
    },
    {
      path: "/TipoAntenaFE/Edit/:id",
      component: AltaTipoAntena,
    },
    {
      path: "/ApoderadoFE/Edit/:id",
      component: AltaApoderado,
    },
    {
      path: "/EstadoTramiteFE/Edit/:id",
      component: AltaEstadoTramite,
    },
    {
      path: "/ExpedienteFE/Edit/:id",
      component: AltaExpediente,
    },
  ];

  const login = [
    {
      path: "/authentication/sign-in/basic",
      component: SignInBasic,
    },
  ];
  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brandName="Antenas"
            brand="https://www.mardelplata.gob.ar/sites/all/themes/mgp/ico/favicon.ico"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        </>
      )}
      <Routes>
        {login.map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
        <Route path="*" element={<Navigate to="/authentication/sign-in/basic" />} />
        {RoutesProtegidas.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              isTokenAvailable() ? (
                <route.component />
              ) : (
                <Navigate to="/authentication/sign-in/basic" />
              )
            }
          />
        ))}
      </Routes>
    </ThemeProvider>
  );
}
