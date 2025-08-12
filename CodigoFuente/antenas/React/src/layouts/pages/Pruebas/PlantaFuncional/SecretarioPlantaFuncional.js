import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import MDAlert from "components/MDAlert";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "../../Pruebas/pruebas.css";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import DataTable from "examples/Tables/DataTable";
import jwt_decode from "jwt-decode";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function SecretarioPlantaFuncional() {
  const [establecimientos, setEstablecimientos] = useState([]);
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState("");
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");
  const [pofData, setPofData] = useState([]);
  const [loadingPof, setLoadingPof] = useState(false);

  // 🔓 Decodificamos el token
  let decodedToken = {};
  if (token) {
    decodedToken = jwt_decode(token);
  }

  const rol = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const idEstablecimiento = decodedToken["idEstablecimiento"];

  useEffect(() => {
    const fetchEstablecimientos = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}Establecimientos/getall`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let data = response.data;

        // Si el usuario es Secretario, filtramos
        if (rol === "Secretario") {
          data = data.filter((e) => e.idEstablecimiento === parseInt(idEstablecimiento));
          setSelectedEstablecimiento(idEstablecimiento); // selecciona por defecto
        }

        setEstablecimientos(data);
      } catch (error) {
        console.error("Error al cargar los establecimientos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstablecimientos();
  }, [token]);

  const handleChange = (event) => {
    setSelectedEstablecimiento(event.target.value);
  };
  const exportToExcel = () => {
    if (pofData.length === 0) return;

    // Transformamos los datos para que sean más legibles en Excel (opcional)
    const dataForExcel = pofData.map((row) => ({
      Apellido: row.persona.apellido,
      Nombre: row.persona.nombre,
      DNI: row.persona.dni,
      Legajo: row.persona.legajo,
      Secuencia: row.secuencia,
      "Tipo Cargo": row.tipoCargo,
      Vigente: row.vigente === "S" ? "SI" : row.vigente === "N" ? "NO" : "N/A",
    }));

    // Creamos una hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Creamos un libro y añadimos la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "POF");

    // Convertimos el libro a un archivo binario
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Creamos un blob y lanzamos la descarga
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "POF_Data.xlsx");
  };

  const handleCargar = async () => {
    setLoadingPof(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}POF/GetByIdEstablecimiento?IdEstablecimiento=${selectedEstablecimiento}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPofData(response.data);
      console.log("PofData: ", pofData);
    } catch (error) {
      console.error("Error al cargar los datos del POF:", error);
    } finally {
      setLoadingPof(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel id="establecimiento-select-label">Establecimiento</InputLabel>
              <Select
                labelId="establecimiento-select-label"
                value={selectedEstablecimiento}
                onChange={handleChange}
                label="Establecimiento"
                style={{ height: "2.5rem", backgroundColor: "white" }}
                disabled={rol === "Secretario"} // ❗ Deshabilita el select si es Secretario
              >
                {establecimientos.map((establecimiento) => (
                  <MenuItem
                    key={establecimiento.idEstablecimiento}
                    value={establecimiento.idEstablecimiento}
                  >
                    {establecimiento.nombrePcia}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <MDBox>
              <MDButton variant="gradient" color="info" size="small" onClick={handleCargar}>
                Cargar
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      {pofData.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <MDBox display="flex" justifyContent="flex-end" mt={2} mr={4}>
            <MDButton
              variant="gradient"
              color="success"
              size="small"
              onClick={exportToExcel}
              disabled={pofData.length === 0}
              style={{ marginLeft: "1rem" }}
            >
              Descargar Excel
            </MDButton>
          </MDBox>
          <DataTable
            table={{
              columns: [
                { Header: "Apellido", accessor: "persona.apellido" },
                { Header: "Nombre", accessor: "persona.nombre" },
                { Header: "DNI", accessor: "persona.dni" },
                { Header: "Legajo", accessor: "persona.legajo" },
                { Header: "Secuencia", accessor: "secuencia" },
                { Header: "Tipo Cargo", accessor: "tipoCargo" },
                {
                  Header: "Vigente",
                  accessor: (row) => (
                    <p>{row.vigente === "S" ? "SI" : row.vigente === "N" ? "NO" : "N/A"}</p>
                  ),
                },
              ],
              rows: pofData,
            }}
            entriesPerPage={false}
            canSearch
          />
        </Card>
      )}
    </DashboardLayout>
  );
}

SecretarioPlantaFuncional.propTypes = {
  row: PropTypes.object,
  "row.original": PropTypes.shape({
    id: PropTypes.number,
  }),
};

export default SecretarioPlantaFuncional;
