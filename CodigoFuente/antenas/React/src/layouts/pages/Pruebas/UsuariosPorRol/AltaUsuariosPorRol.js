import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import axios from "axios";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

function AltaUsuariosPorRol() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [roles, setRoles] = useState([]);
  const [rolesAsignados, setRolesAsignados] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchUsuariosAndRoles = async () => {
      try {
        // Obtener todos los usuarios
        const usuariosResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}usuarios/GetAll`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Obtener usuarios que ya tienen roles asignados
        const usuariosConRolesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}RolesXUsuarios/GetAll`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Extraer IDs de usuarios con roles, asegurándonos de que sean números
        const usuariosConRolesIds = usuariosConRolesResponse.data.map((usuario) =>
          Number(usuario.idUsuario)
        );

        // Filtrar solo los usuarios sin roles asignados y ordenar alfabéticamente por 'nombre'
        const usuariosSinRoles = usuariosResponse.data
          .filter((usuario) => !usuariosConRolesIds.includes(Number(usuario.idUsuario)))
          .sort((a, b) => a.nombre.localeCompare(b.nombre)); // Ordenar alfabéticamente por nombre

        setUsuarios(usuariosSinRoles);

        // Obtener todos los roles
        const rolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}Roles/GetAll`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(rolesResponse.data);
        setRolesDisponibles(rolesResponse.data);
      } catch (err) {
        console.error("Error fetching users or roles", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuariosAndRoles();
  }, [token]);

  const handleUsuarioChange = (event) => {
    setUsuarioSeleccionado(event.target.value);
  };

  const toggleRoleSelection = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r.idRol !== role.idRol));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleAddRoles = () => {
    setRolesAsignados([...rolesAsignados, ...selectedRoles]);
    setRolesDisponibles(rolesDisponibles.filter((rol) => !selectedRoles.includes(rol)));
    setSelectedRoles([]);
  };

  const handleRemoveRoles = () => {
    setRolesDisponibles([...rolesDisponibles, ...selectedRoles]);
    setRolesAsignados(rolesAsignados.filter((rol) => !selectedRoles.includes(rol)));
    setSelectedRoles([]);
  };

  const handleSaveRoles = async () => {
    if (!usuarioSeleccionado) {
      alert("Debe seleccionar un usuario.");
      return;
    }
    const rol = rolesAsignados.map((rol) => rol.idRol);
    setSaving(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}RolesXUsuarios`,
        {
          IdUsuario: usuarioSeleccionado,
          IdRoles: rol,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Roles guardados correctamente.");
      navigate(-1);
    } catch (err) {
      console.error("Error al guardar roles:", err);
      alert("Error al guardar los roles. Por favor, intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };
  const isAddButtonEnabled = selectedRoles.every((rol) =>
    rolesDisponibles.some((disponible) => disponible.idRol === rol.idRol)
  );

  const isRemoveButtonEnabled = selectedRoles.every((rol) =>
    rolesAsignados.some((asignado) => asignado.idRol === rol.idRol)
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container spacing={0} mb={1}>
        <Grid item xs={12}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6">Asignación de Roles a Usuario</MDTypography>
              <Select
                style={{ width: "40%", padding: "8px", color: "#495057" }}
                fullWidth
                value={usuarioSeleccionado}
                onChange={handleUsuarioChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Seleccione un usuario
                </MenuItem>
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.idUsuario} value={usuario.idUsuario}>
                    {usuario.nombre}
                  </MenuItem>
                ))}
              </Select>
            </MDBox>
          </Card>
        </Grid>

        <Grid container spacing={1} justifyContent="center" mt={4}>
          <Grid item xs={5}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6">Roles Disponibles</MDTypography>
              <ul style={{ listStyleType: "none", paddingLeft: 0, paddingTop: 10 }}>
                {rolesDisponibles.map((rol) => (
                  <li
                    key={rol.idRol}
                    onClick={() => toggleRoleSelection(rol)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedRoles.includes(rol) ? "#b2ebf2" : "transparent",
                      padding: "5px",
                      borderRadius: "4px",
                    }}
                  >
                    <MDTypography variant="subtitle2">{rol.nombreRol}</MDTypography>
                  </li>
                ))}
              </ul>
            </Card>
          </Grid>

          <Grid item xs={2}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%" // Asegura que el MDBox ocupe toda la altura
            >
              <MDButton
                variant="contained"
                color="primary"
                size="small"
                onClick={handleAddRoles}
                disabled={!isAddButtonEnabled || selectedRoles.length === 0}
              >
                Agregar Rol
              </MDButton>
              <MDButton
                variant="contained"
                color="secondary"
                size="small"
                sx={{ mt: 2 }}
                onClick={handleRemoveRoles}
                disabled={!isRemoveButtonEnabled || selectedRoles.length === 0}
              >
                Quitar Rol
              </MDButton>
            </MDBox>
          </Grid>

          <Grid item xs={5}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6">Roles Asignados</MDTypography>
              <ul style={{ listStyleType: "none", paddingLeft: 0, paddingTop: 10 }}>
                {rolesAsignados.map((rol) => (
                  <li
                    key={rol.idRol}
                    onClick={() => toggleRoleSelection(rol)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedRoles.includes(rol) ? "#b2ebf2" : "transparent",
                      padding: "5px",
                      borderRadius: "4px",
                    }}
                  >
                    <MDTypography variant="subtitle2">{rol.nombreRol}</MDTypography>
                  </li>
                ))}
              </ul>
            </Card>
          </Grid>
        </Grid>

        <MDBox display="flex" justifyContent="center" alignItems="center" width="100%" mt={4}>
          <MDButton variant="contained" color="error" onClick={() => navigate(-1)} sx={{ mx: 1 }}>
            Cancelar
          </MDButton>
          <MDButton
            variant="contained"
            color="success"
            onClick={handleSaveRoles}
            disabled={saving}
            sx={{ mx: 1 }}
          >
            {saving ? "Guardando..." : "Guardar"}
          </MDButton>
        </MDBox>
      </Grid>
    </DashboardLayout>
  );
}

export default AltaUsuariosPorRol;
