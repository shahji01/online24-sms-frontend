import React from "react";
import { Button } from "react-bootstrap";
import { FaTrashAlt, FaPrint, FaFileExcel, FaUpload } from "react-icons/fa";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import PermissionCheck from "../../../components/PermissionCheck";
import { importSQL } from "./TableService";

const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
  XLSX.writeFile(workbook, filename);
};

const TableActions = ({ selectedTables, tables, onTruncate, onPrint }) => {
  const handleExport = () => {
    const exportData = tables.map(({ table, count }) => ({
      Table: table,
      Count: count,
    }));
    exportToExcel(exportData, "DatabaseTables.xlsx");
  };

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: "Upload SQL File",
      input: "file",
      inputAttributes: { accept: ".sql" },
      showCancelButton: true,
    });

    if (!file) return;
    try {
      const { data } = await importSQL(file);
      Swal.fire(data.success ? "Success" : "Error", data.message, data.success ? "success" : "error");
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="d-flex flex-wrap gap-2">
      <PermissionCheck permission={["truncate-selected"]}>
        <Button
          variant="danger"
          onClick={onTruncate}
          disabled={!selectedTables.length}
        >
          <FaTrashAlt className="me-1" />
          Truncate Selected
        </Button>
      </PermissionCheck>

      <Button variant="secondary" onClick={onPrint}>
        <FaPrint className="me-1" /> Print
      </Button>

      <Button variant="success" onClick={handleExport}>
        <FaFileExcel className="me-1" /> Export Tables
      </Button>

      <Button variant="info" onClick={handleImport}>
        <FaUpload className="me-1" /> Import SQL
      </Button>
    </div>
  );
};

export default TableActions;
