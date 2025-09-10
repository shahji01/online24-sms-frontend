import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Button, FormControl, Badge, Form, Row, Col } from "react-bootstrap";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import DataTable from "react-data-table-component";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import axios from "../../../Utils/axios";
import PermissionCheck from "../../../components/PermissionCheck";
import ToggleButton from "../../../components/Common/ToggleButton";

const SchoolList = ({ onEdit }) => {
  const { t, i18n } = useTranslation();

  const [schools, setSchools] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pending, setPending] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("1");

  const direction = useMemo(
    () => (["ur", "ar"].includes(i18n.language) ? "rtl" : "ltr"),
    [i18n.language]
  );

  /** Fetch Schools */
  const fetchSchools = useCallback(
    async (pageNumber = page, pageSize = perPage) => {
      try {
        setPending(true);
        const res = await axios.protected.post("schools/get-all-school", {
          headers: { "Accept-Language": i18n.language || "en" },
          params: {
            page: pageNumber,
            limit: pageSize,
            search: searchTerm,
            status: statusFilter,
          },
        });
        setSchools(res.data.data || []);
        setTotalRows(res.data.total || 0);
      } catch {
        Swal.fire(t("error"), t("fetch_schools_failed"), "error");
      } finally {
        setPending(false);
      }
    },
    [t, i18n.language, page, perPage, searchTerm, statusFilter]
  );

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  /** Export to Excel */
  const exportXLSX = useCallback(() => {
    const data = schools.map((s, i) => ({
      [t("s_no")]: (page - 1) * perPage + (i + 1),
      [t("name")]: s.name,
      [t("address")]: s.address,
      [t("contact_no")]: s.contact_no,
      [t("status")]: s.status === 1 ? t("active") : t("inactive"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schools");
    XLSX.writeFile(wb, "schools.xlsx");
  }, [schools, page, perPage, t]);

  /** Table columns */
  const columns = useMemo(
    () => [
      {
        name: t("s_no"),
        selector: (_, index) => (page - 1) * perPage + (index + 1),
        width: "70px",
        center: true,
      },
      {
        name: t("name"),
        selector: (r) => r.name,
        sortable: true,
        wrap: true,
      },
      {
        name: t("address"),
        selector: (r) => r.address,
        sortable: true,
        wrap: true,
      },
      {
        name: t("contact_no"),
        selector: (r) => r.contact_no,
        wrap: true,
      },
      {
        name: t("status"),
        center: true,
        cell: (r) => (
          <Badge bg={r.status === 1 ? "success" : "secondary"}>
            {r.status === 1 ? t("active") : t("inactive")}
          </Badge>
        ),
      },
      {
        name: t("actions"),
        center: true,
        cell: (r) => (
          <div className="d-flex gap-2">
            {r.status === 1 && (
              <PermissionCheck permission={["school-edit"]}>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => onEdit(r)}
                >
                  <FaEdit />
                </Button>
              </PermissionCheck>
            )}
            <PermissionCheck permission={["school-status"]}>
              <ToggleButton
                row={r}
                value={r.id}
                type="status"
                route="schools"
                onSuccess={() => fetchSchools(page, perPage)}
              />
            </PermissionCheck>
          </div>
        ),
        ignoreRowClick: true,
        button: true,
      },
    ],
    [t, page, perPage, fetchSchools]
  );

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">{t("schools")}</h4>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={exportXLSX}>
            <FaFileExcel className="me-1" /> {t("export_excel")}
          </Button>
          <PermissionCheck permission={["school-add"]}>
            <Button variant="primary" onClick={() => onEdit(null)}>
              <FaPlus className="me-1" /> {t("add_school")}
            </Button>
          </PermissionCheck>
        </div>
      </div>

      {/* Filters */}
      <Row className="g-2 mb-3">
        <Col md="auto">
          <FormControl
            placeholder={t("search_by_name")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>

        <Col md="auto">
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t("all_status")}</option>
            <option value="1">{t("active")}</option>
            <option value="0">{t("inactive")}</option>
          </Form.Select>
        </Col>

        <Col md="auto">
          <Button onClick={() => fetchSchools(1, perPage)}>{t("apply")}</Button>
        </Col>
      </Row>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={schools}
        progressPending={pending}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationDefaultPage={page}
        onChangeRowsPerPage={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        onChangePage={setPage}
        highlightOnHover
        striped
        responsive
        persistTableHead
      />
    </div>
  );
};

export default SchoolList;
