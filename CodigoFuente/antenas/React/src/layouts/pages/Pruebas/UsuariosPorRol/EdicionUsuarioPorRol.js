import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";

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
      <MDBox display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Card
          style={{
            width: "200px",
            marginRight: "20px",
            padding: "10px",
            backgroundColor: "#e0f7fa",
          }}
        >
          <h3>Roles Disponibles</h3>
          {loading ? (
            <p>Cargando roles disponibles...</p>
          ) : (
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {availableRoles.map((role) => (
                <li
                  key={role.idRol}
                  onClick={() => toggleRoleSelection(role)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedRoles.includes(role) ? "#b2ebf2" : "transparent",
                  }}
                >
                  {role.nombreRol}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center">
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
        <Card
          style={{
            width: "200px",
            marginLeft: "20px",
            padding: "10px",
            backgroundColor: "#e0f7fa",
          }}
        >
          <h3>Roles Asignados</h3>
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {assignedRoles.map((role) => (
              <li
                key={role.idRol}
                onClick={() => toggleRoleSelection(role)}
                style={{
                  cursor: "pointer",
                  backgroundColor: selectedRoles.includes(role) ? "#b2ebf2" : "transparent",
                }}
              >
                {role.nombreRol}
              </li>
            ))}
          </ul>
        </Card>
      </MDBox>
      <MDBox display="flex" justifyContent="center" alignItems="center" mt={4}>
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
