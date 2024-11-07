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
import GestionUsuario from "layouts/pages/Pruebas/GestionUsuarios";
import UsuarioPorRol from "layouts/pages/Pruebas/UsuariosPorRol";
import CabeceraLiquidacion from "layouts/pages/Pruebas/CabeceraLiquidacion";
import ImportarArchivo from "layouts/pages/Pruebas/ImportarArchivoPlano";
import Establecimiento from "layouts/pages/Pruebas/Establecimiento";
import TiposFunciones from "layouts/pages/Pruebas/TiposFunciones";
import TipoLiquidaciones from "layouts/pages/Pruebas/TipoLiquidaciones";
import TipoCategorias from "layouts/pages/Pruebas/TipoCategorias";
import AltaCabeceraLiquidacion from "layouts/pages/Pruebas/CabeceraLiquidacion/AltaCabeceraLiquidacion";
import AltaPersona from "layouts/pages/Pruebas/Persona/AltaPersona";
import AltaGestionUsuario from "layouts/pages/Pruebas/GestionUsuarios/AltaGestionUsuario";
import AltaUsuariosPorRol from "layouts/pages/Pruebas/UsuariosPorRol/AltaUsuariosPorRol";
import EdicionUsuariosPorRol from "layouts/pages/Pruebas/UsuariosPorRol/EdicionUsuariosPorRol";
import AltaEstablecimiento from "layouts/pages/Pruebas/Establecimiento/AltaEstablecimiento";
import AltaTiposFunciones from "layouts/pages/Pruebas/TiposFunciones/AltaTiposFunciones";
import AltaTipoLiquidaciones from "layouts/pages/Pruebas/TipoLiquidaciones/AltaTipoLiquidaciones";
import AltaTipoCategorias from "layouts/pages/Pruebas/TipoCategorias/AltaTipoCategorias";
import VerCabeceraLiquidacion from "layouts/pages/Pruebas/CabeceraLiquidacion/VerCabeceraLiquidacion";
import VerGestionUsuarios from "layouts/pages/Pruebas/GestionUsuarios/VerGestionUsuarios";
import PlantaFuncional from "layouts/pages/Pruebas/PlantaFuncional";
import VerConcepto from "layouts/pages/Pruebas/Conceptos/VerConcepto";
import VerEstablecimiento from "layouts/pages/Pruebas/Establecimiento/VerEstablecimiento";
import Inicio from "layouts/pages/Pruebas/Inicio/Index";

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
    if (!token || isTokenExpired(token)) {
      sessionStorage.removeItem("token");
      return false;
    }
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
    //----------------------------------Rutas de index
    {
      path: "/InicioFE",
      component: Inicio,
    },
    {
      path: "/CabeceraLiquidacionFE",
      component: CabeceraLiquidacion,
    },
    {
      path: "/ImportarArchivoPlanoFE",
      component: ImportarArchivo,
    },
    {
      path: "/PersonaFE",
      component: PersonaListado,
    },
    {
      path: "/GestionUsuariosFE",
      component: GestionUsuario,
    },
    {
      path: "/PlantaFuncionalFE",
      component: PlantaFuncional,
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
      path: "/UsuariosPorRolFE",
      component: UsuarioPorRol,
    },
    {
      path: "/ConceptosFE",
      component: ListadoConceptos,
    },
    {
      path: "/CarRevistaFE",
      component: ListadoCarRevista,
    },
    {
      path: "/TipoEstablecimientoFE",
      component: ListadoTipoEstablecimiento,
    },
    {
      path: "/EstablecimientoFE",
      component: Establecimiento,
    },
    {
      path: "/TiposFuncionesFE",
      component: TiposFunciones,
    },
    {
      path: "/TipoLiquidacionesFE",
      component: TipoLiquidaciones,
    },
    {
      path: "/TipoCategoriasFE",
      component: TipoCategorias,
    },
    {
      path: "/ImportarFE",
      component: Importar,
    },
    //----------------------------------Rutas de Ver mas
    {
      path: "/VerCabeceraLiquidacionFE/:id",
      component: VerCabeceraLiquidacion,
    },
    {
      path: "/VerGestionUsuariosFE/:id",
      component: VerGestionUsuarios,
    },
    {
      path: "/VerConceptoFE/:id",
      component: VerConcepto,
    },
    {
      path: "/CarRevistaFE/:id",
      component: CarRevistaVer,
    },
    {
      path: "/TiposEstablecimientoFE/:id",
      component: CarRevistaVer,
    },
    {
      path: "/VerEstablecimientoFE/:id",
      component: VerEstablecimiento,
    },
    //----------------------------------Rutas de Editar
    {
      path: "/VerCabeceraLiquidacionFe/Edit/:id",
      component: AltaCabeceraLiquidacion,
    },
    {
      path: "/GestionUsuariosFE/Edit/:id",
      component: AltaGestionUsuario,
    },
    {
      path: "/UsuariosPorRolFE/Edit/:id",
      component: EdicionUsuariosPorRol,
    },
    {
      path: "/AltaConceptosFE/Edit/:id",
      component: AltaConceptos,
    },
    {
      path: "/CarRevistaFE/Edit/:id",
      component: AltaCarRevista,
    },
    {
      path: "/TiposEstablecimientoFE/Edit/:id",
      component: AltaTipoEstablecimiento,
    },
    {
      path: "/TiposFuncionesFE/Edit/:id",
      component: AltaTiposFunciones,
    },
    {
      path: "/TipoLiquidacionesFE/Edit/:id",
      component: AltaTipoLiquidaciones,
    },
    {
      path: "/TipoCategoriasFE/Edit/:id",
      component: AltaTipoCategorias,
    },
    {
      path: "/EstablecimientoFE/Edit/:id",
      component: AltaEstablecimiento,
    },
    //----------------------------------Rutas de Alta
    {
      path: "/CabeceraLiquidacionFE/Nuevo",
      component: AltaCabeceraLiquidacion,
    },
    {
      path: "/PersonaFE/Nuevo",
      component: AltaPersona,
    },
    {
      path: "/GestionUsuarioFE/Nuevo",
      component: AltaGestionUsuario,
    },
    {
      path: "/UsuarioPorRolFE/Nuevo",
      component: AltaUsuariosPorRol,
    },
    {
      path: "/ConceptosFE/Nuevo",
      component: AltaConceptos,
    },
    {
      path: "/CarRevistaFE/Nuevo",
      component: AltaCarRevista,
    },
    {
      path: "/TipoEstablecimientoFE/Nuevo",
      component: AltaTipoEstablecimiento,
    },
    {
      path: "/EstablecimientoFE/Nuevo",
      component: AltaEstablecimiento,
    },
    {
      path: "/TiposFuncionesFE/Nuevo",
      component: AltaTiposFunciones,
    },
    {
      path: "/TipoLiquidacionesFE/Nuevo",
      component: AltaTipoLiquidaciones,
    },
    {
      path: "/TipoCategoriasFE/Nuevo",
      component: AltaTipoCategorias,
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
