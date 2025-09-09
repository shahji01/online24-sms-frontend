import React, { useEffect, useState } from "react";
import { Table, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import styles from "@/assets/scss/Stats.module.scss";
import {
  fetchTables,
  truncateTables,
  fetchTableRecords,
} from "./TableService";
import TableActions from "./TableActions";
import RecordsModal from "./RecordsModal";

const DatabaseTablesList = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState("");
  const [tableRecords, setTableRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // ✅ Fetch tables list with updated record counts
  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await fetchTables();
      if (res.data.success) {
        setTables(res.data.tables);
      } else {
        Swal.fire("Error", "Failed to fetch tables", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // ✅ Handle truncate
  const handleTruncate = async () => {
    if (selectedTables.length === 0) {
      return Swal.fire("Warning", "Please select tables", "warning");
    }
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete all records",
      icon: "warning",
      showCancelButton: true,
    });
    if (!isConfirmed) return;

    try {
      await truncateTables(selectedTables);
      Swal.fire("Success", "Truncated successfully", "success");

      // ✅ Option 1: Re-fetch fresh counts from backend
      await loadTables();

      // ✅ Option 2: Update counts in state directly (avoids extra API call)
      setTables((prev) =>
        prev.map((t) =>
          selectedTables.includes(t.table) ? { ...t, count: 0 } : t
        )
      );

      setSelectedTables([]);
    } catch {
      Swal.fire("Error", "Truncate failed", "error");
    }
  };

  const handlePrint = () => window.print();

  // ✅ Open records modal
  const openRecords = async (tableName) => {
    setSelectedTableName(tableName);
    setShowModal(true);
    setLoadingRecords(true);
    try {
      const res = await fetchTableRecords(tableName);
      if (res.data.success) setTableRecords(res.data.records || []);
    } catch {
      Swal.fire("Error", "Failed to fetch records", "error");
    } finally {
      setLoadingRecords(false);
    }
  };

  const toggleSelectAll = () => {
    setSelectedTables(
      selectedTables.length === tables.length ? [] : tables.map((t) => t.table)
    );
  };

  return (
    <div className={styles.statsContainer}>
      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <div className="mb-3 d-flex justify-content-between">
            <TableActions
              selectedTables={selectedTables}
              tables={tables}
              onTruncate={handleTruncate}
              onPrint={handlePrint}
            />
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={selectedTables.length === tables.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Table Name</th>
                <th>Record Count</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t, idx) => (
                <tr key={idx}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedTables.includes(t.table)}
                      onChange={() =>
                        setSelectedTables((prev) =>
                          prev.includes(t.table)
                            ? prev.filter((x) => x !== t.table)
                            : [...prev, t.table]
                        )
                      }
                    />
                  </td>
                  <td>{t.table}</td>
                  <td>
                    <button
                      className="btn btn-link p-0"
                      onClick={() => openRecords(t.table)}
                    >
                      {t.count} Records
                    </button>
                  </td>
                </tr>
              ))}
              {tables.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">
                    No tables found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <RecordsModal
            show={showModal}
            onClose={() => setShowModal(false)}
            records={tableRecords}
            tableName={selectedTableName}
            loading={loadingRecords}
            onRefresh={() => openRecords(selectedTableName)}
          />
        </>
      )}
    </div>
  );
};

export default DatabaseTablesList;
