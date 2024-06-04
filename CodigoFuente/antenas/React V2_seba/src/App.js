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

import { useState, useEffect, useMemo } from "react";

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
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 PRO React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 PRO React routes
import routes from "routes";

// Material Dashboard 2 PRO React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import PruebaForm from "layouts/pages/Pruebas/PruebaForm";
import PruebaTabla from "layouts/pages/Pruebas/PruebaTabla";
import Configurador from "layouts/pages/Pruebas/Configurador";
import GrupoProcesos from "layouts/pages/Pruebas/GrupoProcesos";
import Procesos from "layouts/pages/Pruebas/Procesos";
import UsuarioListados from "layouts/pages/Pruebas/UsuarioListados";
import AltaUsuario from "layouts/pages/UsuarioNuevo/AltaUsuario";

import AltaProceso from "layouts/pages/Pruebas/GrupoProcesos/AltaProceso";
import ProtectedRoute from "./ProtectedRoute";
import TipoEquipamiento from "layouts/pages/Pruebas/TipoEquipamiento/index";
import AltaTipoEquipamiento from "layouts/pages/Pruebas/TipoEquipamiento/AltaTipoEquipamiento";
import Velocidades from "layouts/pages/Pruebas/Velocidades";
import ResponsableTecnico from "layouts/pages/Pruebas/ResponsableTecnico/index";
import AltaResponsableTecnico from "layouts/pages/Pruebas/ResponsableTecnico/AltaResponsableTecnico";
import AltaTipoObra from "layouts/pages/Pruebas/TipoObra/AltaTipoObra";
import TipoObra from "layouts/pages/Pruebas/TipoObra/index";
import Seguro from "layouts/pages/Pruebas/Seguro";
import AltaSeguro from "layouts/pages/Pruebas/Seguro/AltaSeguro";
import AltaVelocidad from "layouts/pages/Pruebas/Velocidades/AltaVelocidad";
import Administracion from "layouts/pages/Pruebas/Administracion/index";
import AltaAdministracion from "layouts/pages/Pruebas/Administracion/AltaAdministracion";

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
    const token = localStorage.getItem("token");
    return token !== null;
  };

  useEffect(() => {
    const storageEventListener = (event) => {
      if (event.storageArea === localStorage && event.key === "token") {
        if (!isTokenAvailable()) {
          localStorage.removeItem("token");
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

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Configurador"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/authentication/sign-in/basic" />} />
        <Route
          path="/dashboards/Configurador"
          element={
            isTokenAvailable() ? <Configurador /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/Configurador/:id"
          element={
            isTokenAvailable() ? <GrupoProcesos /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/TipoEquipamiento/Nuevo"
          element={
            isTokenAvailable() ? (
              <AltaTipoEquipamiento />
            ) : (
              <Navigate to="/authentication/sign-in/basic" />
            )
          }
        />
        <Route
          path="/dashboards/UsuariosListados"
          element={
            isTokenAvailable() ? (
              <UsuarioListados />
            ) : (
              <Navigate to="/authentication/sign-in/basic" />
            )
          }
        />
        <Route
          path="/dashboards/ResponsableTecnico"
          element={
            isTokenAvailable() ? (
              <ResponsableTecnico />
            ) : (
              <Navigate to="/authentication/sign-in/basic" />
            )
          }
        />
        <Route
          path="/dashboards/ResponsableTecnico/Nuevo"
          element={
            isTokenAvailable() ? (
              <AltaResponsableTecnico />
            ) : (
              <Navigate to="/authentication/sign-in/basic" />
            )
          }
        />
        <Route
          path="/dashboards/TipoEquipamiento"
          element={
            isTokenAvailable() ? (
              <TipoEquipamiento />
            ) : (
              <Navigate to="/authentication/sign-in/basic" />
            )
          }
        />
        <Route
          path="/dashboards/Velocidades"
          element={
            isTokenAvailable() ? <Velocidades /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/Velocidades/Nuevo"
          element={
            isTokenAvailable() ? <AltaVelocidad /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/TipoObra/Nuevo"
          element={
            isTokenAvailable() ? <AltaTipoObra /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/TipoObra"
          element={
            isTokenAvailable() ? <TipoObra /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/Seguro"
          element={
            isTokenAvailable() ? <Seguro /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/Seguro/Nuevo"
          element={
            isTokenAvailable() ? <AltaSeguro /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/UsuariosListados/NuevoUsuario"
          element={
            isTokenAvailable() ? <AltaUsuario /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
        <Route
          path="/dashboards/Administracion"
          element={
            isTokenAvailable() ? (
              <Administracion />
            ) : (
              <Navigate to="/authentication/sign-in/basic" />
            )
          }
        />
        <Route
          path="/dashboards/Administracion/Nuevo"
          element={
            isTokenAvailable() ? (
              <AltaAdministracion />
            ) : (
              <Navigate to="/authentication/sign-in/basic" />
            )
          }
        />
        <Route
          path="/dashboards/Configurador/NuevoProceso"
          element={
            isTokenAvailable() ? <AltaProceso /> : <Navigate to="/authentication/sign-in/basic" />
          }
        />
      </Routes>
    </ThemeProvider>
  );
}
