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

import { useState, useEffect } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";

// Material Dashboard 2 PRO React examples
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 PRO React themes
import theme from "assets/theme";

// Material Dashboard 2 PRO React Dark Mode themes
import themeDark from "assets/theme-dark";

// Material Dashboard 2 PRO React routes
import routes from "routes";

// Material Dashboard 2 PRO React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import logo from "assets/images/logo-ct-dark.png";
import UsuarioListados from "layouts/pages/Pruebas/UsuarioListados";
import AltaUsuario from "layouts/pages/UsuarioNuevo/AltaUsuario";
import Velocidades from "layouts/pages/Pruebas/Velocidades";
import ResponsableTecnico from "layouts/pages/Pruebas/ResponsableTecnico/index";
import AltaResponsableTecnico from "layouts/pages/Pruebas/ResponsableTecnico/AltaResponsableTecnico";
import Seguro from "layouts/pages/Pruebas/Seguro";
import AltaSeguro from "layouts/pages/Pruebas/Seguro/AltaSeguro";
import AltaVelocidad from "layouts/pages/Pruebas/Velocidades/AltaVelocidad";
import Administracion from "layouts/pages/Pruebas/Administracion/index";
import AltaAdministracion from "layouts/pages/Pruebas/Administracion/AltaAdministracion";
import Equipamiento from "layouts/pages/Pruebas/Equipamiento";
import AltaEquipamiento from "layouts/pages/Pruebas/Equipamiento/AltaEquipamiento";
import AltaConservadora from "layouts/pages/Pruebas/Conservadora/AltaConservadora";
import Conservadora from "layouts/pages/Pruebas/Conservadora/index";
import TipoObra from "layouts/pages/Pruebas/TipoObra/index";
import AltaTipoObra from "layouts/pages/Pruebas/TipoObra/AltaTipoObra";
import ObraTipo from "layouts/pages/Pruebas/ObraTipo/index";
import AltaObraTipo from "layouts/pages/Pruebas/ObraTipo/AltaObraTipo";
import ObraTipoVer from "layouts/pages/Pruebas/ObraTipo/ObraTipoVer";
import ConservadoraVer from "layouts/pages/Pruebas/Conservadora/ConservadoraVer";
import AdministracionVer from "layouts/pages/Pruebas/Administracion/AdministracionVer";
import AltaMaquina from "layouts/pages/Pruebas/Maquina/index";

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

  const isTokenAvailable = () => {
    const token = sessionStorage.getItem("token"); // Cambio a sessionStorage
    return token !== null;
  };

  useEffect(() => {
    const storageEventListener = (event) => {
      if (event.storageArea === sessionStorage && event.key === "token") {
        if (!isTokenAvailable()) {
          sessionStorage.removeItem("token");
          window.location.href = "/authentication/sign-in/basic";
        }
      }
    };
    window.addEventListener("storage", storageEventListener);
    return () => {
      window.removeEventListener("storage", storageEventListener);
    };
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting page scroll to 0 when changing the route
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

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  const RoutesProtegidas = [
    //------------------------Rutas de Alta---------------------------------------------------
    {
      path: "/dashboards/ResponsableTecnico/Nuevo",
      component: AltaResponsableTecnico,
    },
    {
      path: "/dashboards/Equipamiento/Nuevo",
      component: AltaEquipamiento,
    },
    {
      path: "/dashboards/Velocidades/Nuevo",
      component: AltaVelocidad,
    },
    {
      path: "/dashboards/Seguro/Nuevo",
      component: AltaSeguro,
    },
    {
      path: "/dashboards/UsuariosListados/NuevoUsuario",
      component: AltaUsuario,
    },
    {
      path: "/dashboards/Administracion/Nuevo",
      component: AltaAdministracion,
    },
    {
      path: "/dashboards/Conservadora/Nuevo",
      component: AltaConservadora,
    },
    {
      path: "/dashboards/TipoObra/Nuevo",
      component: AltaTipoObra,
    },
    {
      path: "/dashboards/ObraTipo/Nuevo",
      component: AltaObraTipo,
    },
    {
      path: "/dashboards/Maquina/Nuevo/:idObra",
      component: AltaMaquina,
    },
    //-----------------------------Rutas de Listado-----------------------------------------
    {
      path: "/dashboards/UsuariosListados",
      component: UsuarioListados,
    },
    {
      path: "/dashboards/ResponsableTecnico",
      component: ResponsableTecnico,
    },
    {
      path: "/dashboards/Equipamiento",
      component: Equipamiento,
    },
    {
      path: "/dashboards/Velocidades",
      component: Velocidades,
    },
    {
      path: "/dashboards/Seguro",
      component: Seguro,
    },
    {
      path: "/dashboards/Administracion",
      component: Administracion,
    },
    {
      path: "/dashboards/ConservadoraListado",
      component: Conservadora,
    },
    {
      path: "/dashboards/TipoObra",
      component: TipoObra,
    },
    {
      path: "/dashboards/ObraListado",
      component: ObraTipo,
    },
    //-----------------------------Rutas de Edicion-----------------------------------------
    {
      path: "/dashboards/Administracion/:id",
      component: AdministracionVer,
    },
    {
      path: "/dashboards/Conservadora/:id",
      component: ConservadoraVer,
    },
    {
      path: "/dashboards/ObraTipo/:id",
      component: ObraTipoVer,
    },
    {
      path: "/dashboards/Maquina/Edit/:id",
      component: AltaMaquina,
    },
    {
      path: "/dashboards/Conservadora/Edit/:id",
      component: AltaConservadora,
    },
    {
      path: "/dashboards/Administracion/Edit/:id",
      component: AltaAdministracion,
    },
    {
      path: "/dashboards/Velocidades/Edit/:id",
      component: AltaVelocidad,
    },
    {
      path: "/dashboards/TipoEquipamiento/Edit/:id",
      component: AltaEquipamiento,
    },
    {
      path: "/dashboards/ResponsableTecnico/Edit/:id",
      component: AltaResponsableTecnico,
    },
    {
      path: "/dashboards/TipoObra/Edit/:id",
      component: AltaTipoObra,
    },
    {
      path: "/dashboards/Seguro/Edit/:id",
      component: AltaSeguro,
    },
  ];

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brandName="Elevadores MGP"
            //brand={logo}
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
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
