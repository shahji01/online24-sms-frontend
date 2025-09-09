import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Button,
  FormControl,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import DataTable from "react-data-table-component";
import axios from "../../../Utils/axios";

const ActivityLogs = () => {
  const { t, i18n } = useTranslation();

  const [filters, setFilters] = useState({
    search: "",
    entity: "",
    action: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pending, setPending] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const direction = useMemo(
    () => (["ur", "ar"].includes(i18n.language) ? "rtl" : "ltr"),
    [i18n.language]
  );

  const actionOptions = [
    { value: "", label: t("all") },
    { value: "create", label: t("create") },
    { value: "update", label: t("update") },
    { value: "update-serial-no", label: t("update_serial_no") },
    { value: "toggle-status", label: t("toggle_status") },
    { value: "toggle-publish", label: t("toggle_publish") },
  ];

  const entityOptions = [
    { value: "", label: t("all") },
    { value: 1, label: "Ravi" },
    { value: 2, label: "Name of References" },
    { value: 3, label: "Title of the Books" },
    { value: 4, label: "Title of the Chapters" },
    { value: 5, label: "The Subsidiary Topics" },
    { value: 6, label: "Title of the Hadith" },
    { value: 7, label: "Hadith" },
  ];

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.protected.get("users/get-all-users");
      setUsers(res.data?.data?.data || []);
    } catch (error) {
      Swal.fire(t("error"), t("fetch_users_failed"), "error");
    }
  }, [t]);

  const fetchLogs = useCallback(
    async (pageNumber = page, pageSize = perPage) => {
      try {
        setPending(true);
        const res = await axios.protected.get("activity-logs", {
          params: { page: pageNumber, limit: pageSize, ...filters },
          headers: { "Accept-Language": i18n.language },
        });
        setLogs(res.data?.data || []);
        setTotalRows(res.data?.meta?.total || 0);
      } catch (error) {
        Swal.fire(t("error"), t("fetch_logs_failed"), "error");
      } finally {
        setPending(false);
      }
    },
    [filters, i18n.language, page, perPage, t]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, page, perPage]);

  const exportXLSX = async () => {
    try {
      const res = await axios.protected.get("activity-logs", {
        params: { page: 1, limit: totalRows, ...filters },
        headers: { "Accept-Language": i18n.language },
      });

      const exportData = res.data?.data.map((log, i) => ({
        [t("s_no")]: i + 1,
        [t("user_name")]: log.user_name,
        [t("action")]: log.al_action,
        [t("type")]: entityOptions.find((e) => e.value === log.al_entity)?.label || log.al_entity,
        [t("record_id")]: log.al_entityId,
        [t("old_value")]: JSON.stringify(log.al_oldValue),
        [t("new_value")]: JSON.stringify(log.al_newValue),
        [t("timestamp")]: new Date(log.al_timestamp).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ActivityLogs");
      XLSX.writeFile(workbook, "activity-logs.xlsx");
    } catch (error) {
      Swal.fire(t("error"), t("export_failed"), "error");
    }
  };

  const renderWithTooltip = (text) => {
    const str = typeof text === "string" ? text : JSON.stringify(text);
    const shortText = str?.length > 30 ? str.substring(0, 30) + "..." : str;
    return (
      <OverlayTrigger overlay={<Tooltip>{str}</Tooltip>} placement="top">
        <span>{shortText}</span>
      </OverlayTrigger>
    );
  };

  const columns = [
    {
      name: t("s_no"),
      selector: (row, index) => (page - 1) * perPage + (index + 1),
      width: "70px",
      center: true,
    },
    { name: t("user_name"), selector: (row) => row.user_name, sortable: true, wrap: true },
    { name: t("action"), selector: (row) => row.al_action, sortable: true, wrap: true },
    {
      name: t("type"),
      selector: (row) =>
        entityOptions.find((e) => e.value === row.al_entity)?.label || row.al_entity,
      sortable: true,
      center: true,
    },
    { name: t("record_id"), selector: (row) => row.al_entityId, sortable: true, center: true },
    { name: t("old_value"), cell: (row) => renderWithTooltip(row.al_oldValue), wrap: true },
    { name: t("new_value"), cell: (row) => renderWithTooltip(row.al_newValue), wrap: true },
    {
      name: t("timestamp"),
      selector: (row) => new Date(row.al_timestamp).toLocaleString(),
      sortable: true,
      center: true,
      width: "200px",
    },
  ];

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{t("activity_logs")}</h4>
        <Button variant="success" onClick={exportXLSX}>
          {t("export_excel")}
        </Button>
      </div>

      {/* Filters */}
      <Row className="mb-3 g-2">
        <Col md={2}>
          <Form.Select
            value={filters.action}
            onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
          >
            {actionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={filters.entity}
            onChange={(e) => setFilters((prev) => ({ ...prev, entity: e.target.value }))}
          >
            {entityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2}>
          <Form.Select
            value={filters.userId}
            onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
          >
            <option value="">{t("all_users")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={3} className="d-flex gap-2">
          <FormControl
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
          />
          <FormControl
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </Col>
      </Row>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={logs}
        progressPending={pending}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationDefaultPage={page}
        onChangeRowsPerPage={(newPerPage) => {
          setPerPage(newPerPage);
          setPage(1);
        }}
        onChangePage={(pageNum) => setPage(pageNum)}
        highlightOnHover
        striped
        responsive
        persistTableHead
      />
    </div>
  );
};

export default ActivityLogs;
