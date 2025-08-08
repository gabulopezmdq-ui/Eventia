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
import AltaPlantaFuncional from "layouts/pages/Pruebas/PlantaFuncional/AltaPlantaFuncional";
import RevertirImportacion from "layouts/pages/Pruebas/RevertirImportacion/index";
import ConsolidarMecPof from "layouts/pages/Pruebas/ConsolidarMecPof";
import ProcesarArchivoImportado from "layouts/pages/Pruebas/ProcesarArchivoImportado";
import UsuariosEstablecimientos from "layouts/pages/Pruebas/UsuariosEstablecimientos/Index";
import AltaUsuariosEstablecimientos from "layouts/pages/Pruebas/UsuariosEstablecimientos/AltaUsuariosEstablecimientos";
import MotivoBaja from "layouts/pages/Pruebas/MotivoBaja";
import AltaMotivoBaja from "layouts/pages/Pruebas/MotivoBaja/AltaMotivoBaja";
import TipoMovimiento from "layouts/pages/Pruebas/TiposMovimientos";
import AltaTipoMovimiento from "layouts/pages/Pruebas/TiposMovimientos/AltaTipoMovimientos";
import Bajas from "layouts/pages/Pruebas/Bajas";
import AltaRegistroBaja from "layouts/pages/Pruebas/Bajas/AltaRegistroBaja";
import CabeceraMovimientos from "layouts/pages/Pruebas/Movimientos/CabeceraMovimientos";
import AltaCabeceraMovimiento from "layouts/pages/Pruebas/Movimientos/AltaCabeceraMovimientos";
import PlantaFuncionalSec from "layouts/pages/Pruebas/PlantaFuncional/SecretarioPlantaFuncional";
import AltaCabeceraMovimientos from "layouts/pages/Pruebas/Movimientos/AltaCabeceraMovimientos";
import CargarInasistencia from "layouts/pages/Pruebas/Inasistencias/CargarInasistencia/index";

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

  const filterRoutesByRole = (routes, userRoles) => {
    return routes
      .filter((route) => {
        if (!route.roles) return true;
        const routeRoles = route.roles.map((r) => r.toLowerCase());
        return userRoles.some((role) => routeRoles.includes(role));
      })
      .map((route) => {
        if (route.collapse) {
          return {
            ...route,
            collapse: filterRoutesByRole(route.collapse, userRoles),
          };
        }
        return route;
      });
  };

  const getRolesFromToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) return [];
    try {
      const decodedToken = jwt_decode(token);
      const roles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      return Array.isArray(roles) ? roles.map((r) => r.toLowerCase()) : [roles.toLowerCase()];
    } catch (error) {
      console.error("Failed to decode token", error);
      return [];
    }
  };

  const userRoles = getRolesFromToken(); // reemplaza al antiguo "role"
  const filteredRoutes = filterRoutesByRole(routes, userRoles);

  //Agregar Roles para proteccion por URL !!!!
  //Coincidir roles + path(route) con routes.js para no generar conflictos

  const RoutesProtegidas = [
    //----------------------------------Rutas de index
    {
      path: "/InicioFE",
      component: Inicio,
      roles: ["admin", "superadmin", "secretario"],
    },
    {
      path: "/CabeceraLiquidacionFE",
      component: CabeceraLiquidacion,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CargarInasistencia",
      component: CargarInasistencia,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/ImportarArchivoPlanoFE",
      component: ImportarArchivo,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/RevertirImportacionFE",
      component: RevertirImportacion,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/ProcesarArchivoImportadoFE",
      component: ProcesarArchivoImportado,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/ConsolidarMecPofFE",
      component: ConsolidarMecPof,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/PersonaFE",
      component: PersonaListado,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/GestionUsuariosFE",
      component: GestionUsuario,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/PlantaFuncionalFE",
      component: PlantaFuncional,
      roles: ["admin", "superadmin", "secretario"],
    },
    {
      path: "/UsuariosEstablecimientosFE",
      component: UsuariosEstablecimientos,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CarRevistaFE",
      component: ListadoCarRevista,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CarRevistaFE/Nuevo",
      component: AltaCarRevista,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoEstablecimientoFE",
      component: ListadoTipoEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoEstablecimientoFE/Nuevo",
      component: AltaTipoEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/UsuariosPorRolFE",
      component: UsuarioPorRol,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/ConceptosFE",
      component: ListadoConceptos,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CarRevistaFE",
      component: ListadoCarRevista,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoEstablecimientoFE",
      component: ListadoTipoEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/EstablecimientoFE",
      component: Establecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TiposFuncionesFE",
      component: TiposFunciones,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoLiquidacionesFE",
      component: TipoLiquidaciones,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoCategoriasFE",
      component: TipoCategorias,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/MotivoBajaFE",
      component: MotivoBaja,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoMovimientoFE",
      component: TipoMovimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/ImportarFE",
      component: Importar,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/BajasFE",
      component: Bajas,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CabeceraMovimientos",
      component: CabeceraMovimientos,
      roles: ["admin", "superadmin", "secretario"],
    },
    {
      path: "/PlantaFuncionalSec",
      component: PlantaFuncionalSec,
      roles: ["secretario"],
    },

    //----------------------------------Rutas de Ver mas
    {
      path: "/VerCabeceraLiquidacionFE/:id",
      component: VerCabeceraLiquidacion,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/VerGestionUsuariosFE/:id",
      component: VerGestionUsuarios,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/VerConceptoFE/:id",
      component: VerConcepto,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CarRevistaFE/:id",
      component: CarRevistaVer,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TiposEstablecimientoFE/:id",
      component: CarRevistaVer,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/VerEstablecimientoFE/:id",
      component: VerEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    //----------------------------------Rutas de Editar
    {
      path: "/CabeceraLiquidacionFe/Edit/:id",
      component: AltaCabeceraLiquidacion,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CabeceraMovimientos/Edit/:id",
      component: AltaCabeceraMovimientos,
      roles: ["admin", "superadmin", "secretario"],
    },
    {
      path: "/PersonaFE/Edit/:id",
      component: AltaPersona,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/GestionUsuariosFE/Edit/:id",
      component: AltaGestionUsuario,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/UsuariosPorRolFE/Edit/:id",
      component: EdicionUsuariosPorRol,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/ConceptosFE/Edit/:id",
      component: AltaConceptos,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CarRevistaFE/Edit/:id",
      component: AltaCarRevista,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TiposEstablecimientoFE/Edit/:id",
      component: AltaTipoEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TiposFuncionesFE/Edit/:id",
      component: AltaTiposFunciones,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoLiquidacionesFE/Edit/:id",
      component: AltaTipoLiquidaciones,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoCategoriasFE/Edit/:id",
      component: AltaTipoCategorias,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/MotivoBajaFE/Edit/:id",
      component: AltaMotivoBaja,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoMovimientoFE/Edit/:id",
      component: AltaTipoMovimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/EstablecimientoFE/Edit/:id",
      component: AltaEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/UsuariosEstablecimientosFE/Edit/:id",
      component: AltaUsuariosEstablecimientos,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/BajasFE/Edit/:id",
      component: AltaRegistroBaja,
      roles: ["admin", "superadmin"],
    },
    //----------------------------------Rutas de Alta
    {
      path: "/CabeceraLiquidacionFE/Nuevo",
      component: AltaCabeceraLiquidacion,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/PersonaFE/Nuevo",
      component: AltaPersona,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/PlantaFuncionalFE/Nuevo",
      component: AltaPlantaFuncional,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/GestionUsuarioFE/Nuevo",
      component: AltaGestionUsuario,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/UsuarioPorRolFE/Nuevo",
      component: AltaUsuariosPorRol,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/UsuariosEstablecimientosFE/Nuevo",
      component: AltaUsuariosEstablecimientos,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/ConceptosFE/Nuevo",
      component: AltaConceptos,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CarRevistaFE/Nuevo",
      component: AltaCarRevista,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoEstablecimientoFE/Nuevo",
      component: AltaTipoEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/EstablecimientoFE/Nuevo",
      component: AltaEstablecimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TiposFuncionesFE/Nuevo",
      component: AltaTiposFunciones,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoLiquidacionesFE/Nuevo",
      component: AltaTipoLiquidaciones,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoCategoriasFE/Nuevo",
      component: AltaTipoCategorias,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/MotivoBajaFE/Nuevo",
      component: AltaMotivoBaja,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/TipoMovimientoFE/Nuevo",
      component: AltaTipoMovimiento,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/BajasFE/Nuevo",
      component: AltaRegistroBaja,
      roles: ["admin", "superadmin"],
    },
    {
      path: "/CabeceraMovimientos/Nuevo",
      component: AltaCabeceraMovimiento,
      roles: ["admin", "superadmin", "secretario"],
    },
  ];

  const login = [
    {
      path: "/authentication/sign-in/basic",
      component: SignInBasic,
    },
  ];

  const filteredProtectedRoutes = RoutesProtegidas.filter((route) => {
    if (!route.roles) return true;
    const routeRoles = route.roles.map((r) => r.toLowerCase());
    return userRoles.some((role) => routeRoles.includes(role));
  });

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
