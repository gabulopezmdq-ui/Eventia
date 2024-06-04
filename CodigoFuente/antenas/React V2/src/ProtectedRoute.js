import React from "react";
import { Route, Navigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  if (!token) {
    return <Navigate to="/authentication/sign-in/basic" />;
  }

  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired, // Asegura que 'element' sea un elemento React válido
};

export default ProtectedRoute;
