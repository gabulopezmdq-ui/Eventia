import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";
import FormField from "layouts/pages/account/components/FormField";

function EdicionUsuariosPorRol() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState(null);
  const [roles, setRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchRolesData = async () => {
      try {
        const userRolesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}RolesXUsuarios/getbyid?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserRoles(userRolesResponse.data);
        setAssignedRoles(userRolesResponse.data.roles);

        const rolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}Roles/GetAll`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRoles(rolesResponse.data);
        const assignedIds = new Set(userRolesResponse.data.roles.map((role) => role.idRol));
        setAvailableRoles(rolesResponse.data.filter((role) => !assignedIds.has(role.idRol)));
      } catch (err) {
        setError("Error al obtener los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchRolesData();
  }, [id, token]);

  const toggleRoleSelection = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r.idRol !== role.idRol));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleAddRoles = () => {
    setAssignedRoles([...assignedRoles, ...selectedRoles]);
    setAvailableRoles(availableRoles.filter((role) => !selectedRoles.includes(role)));
    setSelectedRoles([]);
  };

  const handleRemoveRoles = () => {
    setAvailableRoles([...availableRoles, ...selectedRoles]);
    setAssignedRoles(assignedRoles.filter((role) => !selectedRoles.includes(role)));
    setSelectedRoles([]);
  };

  const handleSaveRoles = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}RolesXUsuarios`,
        {
          IdUsuario: id,
          IdRoles: assignedRoles.map((role) => role.idRol),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Roles guardados correctamente.");
      navigate(-1);
    } catch (err) {
      alert("Error al guardar los roles.");
    } finally {
      setSaving(false);
    }
  };

  const isAddButtonEnabled = selectedRoles.every((role) =>
    availableRoles.some((availableRole) => availableRole.idRol === role.idRol)
  );

  const isRemoveButtonEnabled = selectedRoles.every((role) =>
    assignedRoles.some((assignedRole) => assignedRole.idRol === role.idRol)
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card id="basic-info" sx={{ overflow: "visible" }}>
            <MDBox display="flex">
              <MDBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="4rem"
                height="4rem"
                variant="gradient"
                bgColor="info"
                color="white"
                shadow="md"
                borderRadius="xl"
                ml={3}
                mt={-2}
              >
                <Icon fontSize="medium" color="inherit">
                  manage_accounts_Icon
                </Icon>
              </MDBox>
              <MDTypography variant="h6" sx={{ mt: 2, mb: 1, ml: 2 }}>
                Edicion Roles por Usuario
              </MDTypography>
            </MDBox>
            <MDBox component="form" pb={3} px={3} mt={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormField
                    label="Origen"
                    name="Origen"
                    value={userRoles?.email || ""}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    label="Nombre de Usuario"
                    name="nombreUsuario"
                    value={userRoles?.nombreUsuario || ""}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
      <MDBox display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Grid container spacing={3} mb={4} alignItems={"center"}>
          <Grid item xs={5}>
            <Card
              style={{
                marginRight: "20px",
                padding: "15px",
              }}
            >
              <MDTypography variant="h6">Roles Disponibles</MDTypography>
              {loading ? (
                <p>Cargando roles disponibles...</p>
              ) : (
                <ul style={{ listStyleType: "none", paddingLeft: 0, paddingTop: 10 }}>
                  {availableRoles.map((role) => (
                    <li
                      key={role.idRol}
                      onClick={() => toggleRoleSelection(role)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedRoles.includes(role) ? "#b2ebf2" : "transparent",
                      }}
                    >
                      <MDTypography variant="subtitle2">{role.nombreRol}</MDTypography>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Grid>
          <Grid item xs={2}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <MDButton
                variant="contained"
                color="primary"
                size="small"
                onClick={handleAddRoles}
                disabled={!isAddButtonEnabled || selectedRoles.length === 0}
              >
                AGREGAR ROL
              </MDButton>
              <MDButton
                variant="contained"
                color="secondary"
                size="small"
                style={{ marginTop: 4 }}
                onClick={handleRemoveRoles}
                disabled={!isRemoveButtonEnabled || selectedRoles.length === 0}
              >
                QUITAR ROL
              </MDButton>
            </MDBox>
          </Grid>
          <Grid item xs={5}>
            <Card
              style={{
                marginRight: "20px",
                padding: "15px",
              }}
            >
              <MDTypography variant="h6">Roles Asignados</MDTypography>
              <ul style={{ listStyleType: "none", paddingLeft: 0, paddingTop: 10 }}>
                {assignedRoles.map((role) => (
                  <li
                    key={role.idRol}
                    onClick={() => toggleRoleSelection(role)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedRoles.includes(role) ? "#b2ebf2" : "transparent",
                    }}
                  >
                    <MDTypography variant="subtitle2">{role.nombreRol}</MDTypography>
                  </li>
                ))}
              </ul>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox display="flex" justifyContent="center" alignItems="center" mt={0}>
        <MDButton variant="contained" color="error" onClick={() => navigate(-1)}>
          CANCELAR
        </MDButton>
        <MDButton
          variant="contained"
          color="success"
          onClick={handleSaveRoles}
          disabled={saving}
          style={{ marginLeft: "10px" }}
        >
          {saving ? "GUARDANDO..." : "GUARDAR"}
        </MDButton>
      </MDBox>
    </DashboardLayout>
  );
}

export default EdicionUsuariosPorRol;
