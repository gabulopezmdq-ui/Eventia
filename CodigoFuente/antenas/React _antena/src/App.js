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
import EstadoInspeccion from "layouts/pages/Pruebas/EstadoInspeccion";
import Usuario from "layouts/pages/Pruebas/Usuario";
import TipoAntena from "layouts/pages/Pruebas/TipoAntena/TipoAntena";

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
    //-----------------------------Rutas de Listado-----------------------------------------
    {
      path: "/AntenaFE",
      component: Antena,
    },
    {
      path: "/EmpresaFE",
      component: Empresa,
    },
    {
      path: "/ApoderadoLegalFE",
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
      path: "/EstadoInspeccionFE",
      component: EstadoInspeccion,
    },
    {
      path: "/UsuarioFE",
      component: Usuario,
    },
    {
      path: "/TipoAntenaFE",
      component: TipoAntena,
    },
    //-----------------------------Rutas de Edicion-----------------------------------------
    {
      path: "/AntenaFE/:id",
      component: AntenaVer,
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
