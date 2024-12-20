import { useMemo, useState } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-table components
import { useTable, useGlobalFilter, useSortBy } from "react-table";

// @mui material components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 PRO React examples
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

function DataTable({
  entriesPerPage,
  canSearch,
  showTotalEntries,
  table,
  isSorted,
  noEndBorder,
  mostrarBotonEdicion,
  mostrarBotonEliminacion,
  onEdicion,
  onEliminacion,
}) {
  const columns = useMemo(() => (table && table.columns ? table.columns : []), [table]);
  const data = useMemo(() => (table && table.rows ? table.rows : []), [table]);

  const tableInstance = useTable({ columns, data }, useGlobalFilter, useSortBy);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    state: { globalFilter },
  } = tableInstance;

  // Simple entries calculations since pagination is removed
  const entriesStart = 1;
  const entriesEnd = rows.length;

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      <Table {...getTableProps()}>
        <MDBox component="thead">
          {headerGroups.map((headerGroup, key) => (
            <TableRow key={key} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, idx) => (
                <DataTableHeadCell
                  key={idx}
                  {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                  width={column.width ? column.width : "auto"}
                  align={column.align ? column.align : "center"}
                >
                  <MDTypography variant="body2" fontWeight="bold">
                    {column.render("Header")}
                  </MDTypography>
                </DataTableHeadCell>
              ))}
            </TableRow>
          ))}
        </MDBox>
        <TableBody {...getTableBodyProps()}>
          {rows.map((row, key) => {
            prepareRow(row);
            return (
              <TableRow
                key={key}
                {...row.getRowProps()}
                sx={{
                  backgroundColor: key % 2 === 0 ? "lightblue" : "white", // Alternar colores
                  "&:hover": {
                    backgroundColor: "lightgray", // Color al pasar el cursor
                  },
                }}
              >
                {row.cells.map((cell, idx) => (
                  <DataTableBodyCell
                    key={idx}
                    noBorder={noEndBorder && rows.length - 1 === key}
                    align={cell.column.align ? cell.column.align : "center"}
                    {...cell.getCellProps()}
                  >
                    {cell.render("Cell")}
                  </DataTableBodyCell>
                ))}
                {mostrarBotonEdicion && (
                  <MDButton color="info" onClick={() => onEdicion(row.original)}>
                    Editar
                  </MDButton>
                )}
                {mostrarBotonEliminacion && (
                  <MDButton color="error" onClick={() => onEliminacion(row.original)}>
                    Eliminar
                  </MDButton>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {showTotalEntries && (
        <MDBox mb={3}>
          <MDTypography variant="button" color="secondary" fontWeight="regular"></MDTypography>
        </MDBox>
      )}
    </TableContainer>
  );
}

DataTable.defaultProps = {
  entriesPerPage: { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  canSearch: false,
  showTotalEntries: true,
  isSorted: true,
  noEndBorder: false,
  mostrarBotonEdicion: false,
  mostrarBotonEliminacion: false,
  onEdicion: () => {},
  onEliminacion: () => {},
};

DataTable.propTypes = {
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
  mostrarBotonEdicion: PropTypes.bool,
  mostrarBotonEliminacion: PropTypes.bool,
  onEdicion: PropTypes.func,
  onEliminacion: PropTypes.func,
};

export default DataTable;
