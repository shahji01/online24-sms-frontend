import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import axios from '../../../Utils/axios';
import {
  Table,
  Button,
  Form,
  Spinner,
  Modal,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  FaPrint,
  FaTrashAlt,
  FaFileExcel,
  FaTimes,
  FaSearch,
} from 'react-icons/fa';
import styles from '@/assets/scss/Stats.module.scss';
import PermissionCheck from '../../../components/PermissionCheck';

const PAGE_SIZE = 20;

const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
  XLSX.writeFile(workbook, filename);
};

const exportToCSV = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(url);
};

const DatabaseTablesList = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState('');
  const [tableRecords, setTableRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordSearch, setRecordSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecords, setSelectedRecords] = useState([]); // uses id or serialized record
  const printRef = useRef(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.protected.get('database/tables');
      if (res.data.success) {
        setTables(res.data.tables);
      } else {
        Swal.fire('Error', 'Failed to fetch tables', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Something went wrong while fetching tables', 'error');
    } finally {
      setLoading(false);
      setSelectedTables([]);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCheckboxChange = (tableName) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName]
    );
  };

  const isAllSelected = useMemo(() => {
    return tables.length > 0 && selectedTables.length === tables.length;
  }, [tables, selectedTables]);

  const toggleSelectAll = () => {
    setSelectedTables(isAllSelected ? [] : tables.map((t) => t.table));
  };

  const handleTruncate = async () => {
    if (selectedTables.length === 0) {
      return Swal.fire('Warning', 'Please select at least one table.', 'warning');
    }

    const { isConfirmed } = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently remove all data from selected tables.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, truncate',
    });

    if (!isConfirmed) return;

    try {
      const res = await axios.protected.delete('database/truncate-selected', {
        data: { tables: selectedTables },
      });

      if (res.data.success) {
        Swal.fire('Success', res.data.message, 'success');
        setSelectedTables([]);
        fetchTables();
      } else {
        Swal.fire('Error', 'Truncate failed', 'error');
      }
    } catch {
      Swal.fire('Error', 'Something went wrong during truncation', 'error');
    }
  };

  const handleExportTables = () => {
    setExporting(true);
    try {
      const exportData = tables.map((t) => ({
        Table: t.table,
        Count: t.count,
      }));
      exportToExcel(exportData, 'DatabaseTables.xlsx');
    } catch (e) {
      Swal.fire('Error', 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const originalContents = document.body.innerHTML;
    const printContents = printRef.current.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const fetchTableRecords = async (tableName) => {
    setSelectedTableName(tableName);
    setShowModal(true);
    setLoadingRecords(true);
    setRecordSearch('');
    setCurrentPage(1);
    setSelectedRecords([]);
    try {
      const res = await axios.protected.get(`database/table-records/${tableName}`);
      if (res.data.success) {
        setTableRecords(res.data.records || []);
      } else {
        Swal.fire('Error', 'Failed to fetch records', 'error');
        setTableRecords([]);
      }
    } catch {
      Swal.fire('Error', 'Something went wrong', 'error');
      setTableRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!recordSearch) return tableRecords;
    const lower = recordSearch.toLowerCase();
    return tableRecords.filter((rec) =>
      Object.values(rec)
        .join(' ')
        .toLowerCase()
        .includes(lower)
    );
  }, [recordSearch, tableRecords]);

  const pageCount = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  const recordHasId = useMemo(() => {
    return tableRecords.length > 0 && Object.prototype.hasOwnProperty.call(tableRecords[0], 'id');
  }, [tableRecords]);

  const handleRecordCheckboxChange = (identifier) => {
    setSelectedRecords((prev) =>
      prev.includes(identifier)
        ? prev.filter((r) => r !== identifier)
        : [...prev, identifier]
    );
  };

  const isAllRecordsSelected = useMemo(() => {
    if (paginatedRecords.length === 0) return false;
    const ids = paginatedRecords.map((r) =>
      recordHasId ? String(r.id) : JSON.stringify(r)
    );
    return ids.every((id) => selectedRecords.includes(id));
  }, [paginatedRecords, selectedRecords, recordHasId]);

  const toggleSelectAllRecords = () => {
    if (isAllRecordsSelected) {
      const idsToRemove = paginatedRecords.map((r) =>
        recordHasId ? String(r.id) : JSON.stringify(r)
      );
      setSelectedRecords((prev) => prev.filter((id) => !idsToRemove.includes(id)));
    } else {
      const idsToAdd = paginatedRecords.map((r) =>
        recordHasId ? String(r.id) : JSON.stringify(r)
      );
      setSelectedRecords((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    }
  };

  const handleDeleteSelectedRecords = async () => {
    if (selectedRecords.length === 0) {
      return Swal.fire('Warning', 'No records selected to delete', 'warning');
    }

    const { isConfirmed } = await Swal.fire({
      title: `Delete ${selectedRecords.length} record(s)?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    });

    if (!isConfirmed) return;

    try {
      const payload = recordHasId
        ? { ids: selectedRecords }
        : { records: selectedRecords.map((r) => JSON.parse(r)) };

      const res = await axios.protected.post(
        `database/delete-records/${selectedTableName}`,
        payload
      );

      if (res.data.success) {
        Swal.fire('Deleted', res.data.message || 'Records deleted', 'success');
        await fetchTableRecords(selectedTableName);
      } else {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    } catch {
      Swal.fire('Error', 'Something went wrong while deleting', 'error');
    }
  };

  const handleDeleteSingleRecord = async (record) => {
    const identifier = recordHasId ? String(record.id) : JSON.stringify(record);
    const { isConfirmed } = await Swal.fire({
      title: 'Delete record?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });
    if (!isConfirmed) return;

    try {
      const payload = recordHasId
        ? { id: identifier }
        : { record: JSON.parse(identifier) };

      const res = await axios.protected.post(
        `database/delete-records/${selectedTableName}`,
        payload
      );

      if (res.data.success) {
        Swal.fire('Deleted', res.data.message || 'Record deleted', 'success');
        await fetchTableRecords(selectedTableName);
      } else {
        Swal.fire('Error', 'Delete failed', 'error');
      }
    } catch {
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handleExportRecords = (format) => {
    if (filteredRecords.length === 0) {
      return Swal.fire('Info', 'No data to export', 'info');
    }
    const filenameBase = `${selectedTableName}_records`;
    try {
      if (format === 'excel') {
        exportToExcel(filteredRecords, `${filenameBase}.xlsx`);
      } else {
        exportToCSV(filteredRecords, `${filenameBase}.csv`);
      }
    } catch {
      Swal.fire('Error', 'Export failed', 'error');
    }
  };

  useEffect(() => {
    if (!showModal) {
      setSelectedRecords([]);
    }
  }, [showModal]);

  return (
    <div className={styles.statsContainer}>
      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <div className="mb-3 d-flex flex-wrap gap-2 justify-content-between">
            <div className="d-flex gap-2 flex-wrap">
              <PermissionCheck permission={['truncate-selected']}>
                <Button
                  variant="danger"
                  onClick={handleTruncate}
                  disabled={selectedTables.length === 0}
                  data-testid="truncate-selected"
                >
                  <FaTrashAlt className="me-1" />
                  Truncate Selected
                </Button>
              </PermissionCheck>

              <Button variant="secondary" onClick={handlePrint}>
                <FaPrint className="me-1" />
                Print
              </Button>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="success"
                onClick={handleExportTables}
                disabled={exporting}
              >
                <FaFileExcel className="me-1" />
                {exporting ? 'Exporting...' : 'Export Tables'}
              </Button>
            </div>
          </div>

          <div ref={(el) => (printRef.current = el)}>
            <h2 className="mb-3">Database Tables List</h2>
            <Table striped bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <Form.Check
                      type="checkbox"
                      id="select-all"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Table Name</th>
                  <th>Record Count</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table, index) => (
                  <tr key={index}>
                    <td style={{ width: 40 }}>
                      <Form.Check
                        type="checkbox"
                        id={`checkbox-${index}`}
                        checked={selectedTables.includes(table.table)}
                        onChange={() => handleCheckboxChange(table.table)}
                      />
                    </td>
                    <td>{table.table}</td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-underline"
                        onClick={() => fetchTableRecords(table.table)}
                      >
                        {table.count} Records
                      </Button>
                    </td>
                  </tr>
                ))}
                {tables.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center">
                      No tables found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Records Modal */}
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            size="xl"
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title>Records of: {selectedTableName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {loadingRecords ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  <div className="d-flex flex-wrap gap-2 mb-3 justify-content-between">
                    <div className="d-flex gap-2 flex-wrap">
                      <InputGroup size="sm" style={{ maxWidth: 300 }}>
                        <InputGroup.Text>
                          <FaSearch />
                        </InputGroup.Text>
                        <FormControl
                          placeholder="Search records..."
                          value={recordSearch}
                          onChange={(e) => {
                            setRecordSearch(e.target.value);
                            setCurrentPage(1);
                          }}
                        />
                      </InputGroup>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleDeleteSelectedRecords}
                        disabled={selectedRecords.length === 0}
                      >
                        <FaTrashAlt className="me-1" />
                        Delete Selected ({selectedRecords.length})
                      </Button>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleExportRecords('excel')}
                        disabled={filteredRecords.length === 0}
                      >
                        <FaFileExcel className="me-1" />
                        Export Excel
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExportRecords('csv')}
                        disabled={filteredRecords.length === 0}
                      >
                        CSV
                      </Button>
                    </div>
                  </div>

                  {filteredRecords.length === 0 ? (
                    <p>No records found.</p>
                  ) : (
                    <div className="table-responsive">
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th style={{ width: 40 }}>
                              <Form.Check
                                type="checkbox"
                                checked={isAllRecordsSelected}
                                onChange={toggleSelectAllRecords}
                              />
                            </th>
                            {Object.keys(filteredRecords[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRecords.map((record, rIdx) => {
                            const identifier = recordHasId
                              ? String(record.id)
                              : JSON.stringify(record);
                            return (
                              <tr key={rIdx}>
                                <td>
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedRecords.includes(identifier)}
                                    onChange={() =>
                                      handleRecordCheckboxChange(identifier)
                                    }
                                  />
                                </td>
                                {Object.values(record).map((val, cIdx) => (
                                  <td key={cIdx}>{String(val)}</td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>

                      {pageCount > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div>
                            Page {currentPage} of {pageCount}
                          </div>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                              Previous
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              disabled={currentPage === pageCount}
                              onClick={() =>
                                setCurrentPage((p) => Math.min(pageCount, p + 1))
                              }
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                <FaTimes className="me-1" />
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DatabaseTablesList;
