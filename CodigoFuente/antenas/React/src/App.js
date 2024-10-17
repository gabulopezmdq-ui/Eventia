import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import jwt_decode from "jwt-decode";
import SignInBasic from "../src/layouts/authentication/sign-in/basic/index";
import PersonaListado from "layouts/pages/Pruebas/Persona/index";
import PersonaAlta from "layouts/pages/Pruebas/Persona/AltaPersona.js";
import ListadoCarRevista from "layouts/pages/Pruebas/CarRevista/index";
import AltaCarRevista from "layouts/pages/Pruebas/CarRevista/AltaCarRevista";
import CarRevistaVer from "layouts/pages/Pruebas/CarRevista/CarRevistaVer";
import AltaTipoEstablecimiento from "layouts/pages/Pruebas/TipoEstablecimiento/AltaTipoEstablecimiento";
import ListadoTipoEstablecimiento from "layouts/pages/Pruebas/TipoEstablecimiento";
import AltaConceptos from "layouts/pages/Pruebas/Conceptos/AltaConceptos";
import ListadoConceptos from "layouts/pages/Pruebas/Conceptos";
import Importar from "layouts/pages/Pruebas/Importar";

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

  // Validate token
  const isTokenExpired = (token, subtractSeconds = 0) => {
    const decodedToken = jwt_decode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decodedToken.exp - subtractSeconds;
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
        return <Route exact path={route.route} element={<route.component />} key={route.key} />;
      }
      return null;
    });

  //Filtrado de las rutas + roles

  const filterRoutesByRole = (routes, role) => {
    return routes
      .filter((route) => !route.roles || route.roles.includes(role))
      .map((route) => {
        if (route.collapse) {
          return {
            ...route,
            collapse: filterRoutesByRole(route.collapse, role),
          };
        }
        return route;
      });
  };

  const getRoleFromToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return null;
    try {
      const decodedToken = jwt_decode(token);
      return decodedToken.role;
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  };

  const role = getRoleFromToken();
  const filteredRoutes = filterRoutesByRole(routes, role);

  //Agregar Roles para proteccion por URL !!!!
  //Coincidir roles + path(route) con routes.js para no generar conflictos

  const RoutesProtegidas = [
    {
      path: "/PersonaFE",
      component: PersonaListado,
    },
    {
      path: "/PersonaFE/Nuevo",
      component: PersonaAlta,
    },
    {
      path: "/POFFE",
      component: POFListado,
    },
    {
      path: "/POFFE/Nuevo",
      component: AltaPOF,
    },
    {
      path: "/CarRevistaFE",
      component: ListadoCarRevista,
    },
    {
      path: "/CarRevistaFE/Nuevo",
      component: AltaCarRevista,
    },
    {
      path: "/TipoEstablecimientoFE",
      component: ListadoTipoEstablecimiento,
    },
    {
      path: "/TipoEstablecimientoFE/Nuevo",
      component: AltaTipoEstablecimiento,
    },
    {
      path: "/ConceptosFE",
      component: ListadoConceptos,
    },
    {
      path: "/ConceptosFE/Nuevo",
      component: AltaConceptos,
    },
    {
      path: "/ImportarFE",
      component: Importar,
    },
  ];

  const login = [
    {
      path: "/authentication/sign-in/basic",
      component: SignInBasic,
    },
  ];

  const filteredProtectedRoutes = RoutesProtegidas.filter(
    (route) => !route.roles || route.roles.includes(role)
  );

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <Sidenav
          color={sidenavColor}
          brandName="Mecanizadas"
          brand="https://www.mardelplata.gob.ar/sites/all/themes/mgp/ico/favicon.ico"
          routes={filteredRoutes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}
      <Routes>
        {login.map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
        <Route path="*" element={<Navigate to="/authentication/sign-in/basic" />} />
        {filteredProtectedRoutes.map((route) => (
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
