import React, { useState, useMemo } from "react";
import { Modal, Button, Table, Spinner, Form } from "react-bootstrap";
import {
  FaTrashAlt,
  FaTimes,
  FaFileExcel,
  FaEdit,
  FaUpload,
  FaSearch,
} from "react-icons/fa";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { deleteRecords, importTableData } from "./TableService";
import RecordEditor from "./RecordEditor";

const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
  XLSX.writeFile(workbook, filename);
};

const RecordsModal = ({ show, onClose, records, tableName, loading, onRefresh }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // show 10 records per page

  const handleDelete = async (record) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete record?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
    });

    if (!isConfirmed) return;
    try {
      const { data } = await deleteRecords(tableName, { record });
      if (data.success) {
        Swal.fire("Deleted", "Record deleted", "success");
        onRefresh();
      } else {
        Swal.fire("Error", "Delete failed", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleImport = async () => {
    const { value: file } = await Swal.fire({
      title: `Import data into ${tableName}`,
      input: "file",
      inputAttributes: { accept: ".csv,.xlsx" },
      showCancelButton: true,
    });

    if (!file) return;
    try {
      const { data } = await importTableData(tableName, file);
      Swal.fire(
        data.success ? "Success" : "Error",
        data.message,
        data.success ? "success" : "error"
      );
      if (data.success) onRefresh();
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  // ✅ Search filter across all fields
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    return records.filter((rec) =>
      Object.values(rec).some((val) =>
        String(val || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [records, searchTerm]);

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Modal show={show} onHide={onClose} size="xl" backdrop="static" dialogClassName="records-modal">
      <Modal.Header closeButton>
        <Modal.Title>Records of {tableName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : records.length === 0 ? (
          <p>No records found</p>
        ) : (
          <>
            {/* ✅ Search bar */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Control
                type="text"
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset to first page on new search
                }}
                style={{ maxWidth: "300px" }}
              />
              <div className="small text-muted">
                Showing {paginatedRecords.length} of {filteredRecords.length} records
              </div>
            </div>

            {/* ✅ Scrollable Table */}
            <div style={{ maxHeight: "65vh", overflow: "auto" }}>
              <Table striped bordered hover size="sm" responsive>
                <thead className="table-light sticky-top">
                  <tr>
                    {Object.keys(records[0]).map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record, idx) =>
                    editingIndex === idx ? (
                      <RecordEditor
                        key={idx}
                        record={record}
                        tableName={tableName}
                        onSave={onRefresh}
                        onCancel={() => setEditingIndex(null)}
                      />
                    ) : (
                      <tr key={idx}>
                        {Object.values(record).map((val, i) => (
                          <td key={i} style={{ whiteSpace: "nowrap" }}>
                            {String(val)}
                          </td>
                        ))}
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => setEditingIndex(idx)}
                          >
                            <FaEdit />
                          </Button>{" "}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(record)}
                          >
                            <FaTrashAlt />
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </Table>
            </div>

            {/* ✅ Pagination controls */}
            <div className="d-flex justify-content-between align-items-center mt-2">
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                size="sm"
                variant="outline-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={() => exportToExcel(records, `${tableName}.xlsx`)}>
          <FaFileExcel className="me-1" /> Export
        </Button>
        <Button variant="info" onClick={handleImport}>
          <FaUpload className="me-1" /> Import Data
        </Button>
        <Button variant="secondary" onClick={onClose}>
          <FaTimes className="me-1" /> Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecordsModal;
