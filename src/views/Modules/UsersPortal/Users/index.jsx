import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../../Utils/axios";
import {
  Table,
  Button,
  Badge,
  InputGroup,
  FormControl,
  Spinner,
  Modal,
  Form,
} from "react-bootstrap";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const Users = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.protected.get("users/get-all-users");
      setUsers(res.data?.data?.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("fetch_error_title"),
        text: error?.response?.data?.message || t("unexpected_error"),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Open Modal for Add/Edit
  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        phone: user.phone,
        role_id: user.role_id || "",
      });
    } else {
      setFormData({ name: "", email: "", password: "", phone: "", role_id: "" });
    }
    setShowModal(true);
  };

  // Add or Edit User
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.protected.patch(
          `users/updateUser/${editingUser.id}`,
          payload
        );

        Swal.fire({
          icon: "success",
          title: t("success"),
          text: t("user_update_success"),
        });
      } else {
        await axios.protected.post("users/register", formData);
        Swal.fire({
          icon: "success",
          title: t("success"),
          text: t("user_register_success"),
        });
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", phone: "", role_id: "" });
      fetchUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: editingUser ? t("update_failed") : t("registration_failed"),
        text: error?.response?.data?.message || t("operation_failed"),
      });
    }
  };

  // Toggle Active/Inactive Status
  const toggleStatus = async (user) => {
    try {
      const newStatus = user.status === 1 ? 2 : 1;
      await axios.protected.patch(`users/${user.id}/status`, {
        status: newStatus,
      });
      Swal.fire({
        icon: "success",
        title: t("status_updated"),
        text:
          newStatus === 1
            ? t("user_now_active")
            : t("user_now_inactive"),
      });
      fetchUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("update_failed"),
        text: error?.response?.data?.message || t("operation_failed"),
      });
    }
  };

  // Export Excel
  const exportToExcel = () => {
    const exportData = filteredUsers.map((user, i) => ({
      [t("s_no")]: i + 1,
      [t("name")]: user.name,
      [t("email")]: user.email,
      [t("phone")]: user.phone,
      [t("status")]: user.status === 1 ? t("active") : t("inactive"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t("users"));
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const renderStatusBadge = (status) =>
    status === 1 ? (
      <Badge bg="success">{t("active")}</Badge>
    ) : (
      <Badge bg="secondary">{t("inactive")}</Badge>
    );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{t("users")}</h4>
        <div>
          <Button variant="primary" className="me-2" onClick={() => openModal()}>
            {t("register_user")}
          </Button>
          <Button variant="success" onClick={exportToExcel}>
            {t("export_excel")}
          </Button>
        </div>
      </div>

      {/* Search */}
      <InputGroup className="mb-3">
        <FormControl
          placeholder={t("search_by_name_or_email")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Table */}
      {loading ? (
        <div className="text-center p-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">{t("s_no")}</th>
              <th className="text-center">{t("name")}</th>
              <th className="text-center">{t("email")}</th>
              <th className="text-center">{t("phone")}</th>
              <th className="text-center">{t("status")}</th>
              <th className="text-center">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td className="text-center">
                    {renderStatusBadge(user.status)}
                  </td>
                  <td className="text-center">
                    {user.status === 1 && (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => openModal(user)}
                      >
                        {t("edit")}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={user.status === 1 ? "secondary" : "success"}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 1 ? t("deactivate") : t("activate")}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  {t("no_users_found")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingUser ? t("edit_user") : t("register_user")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>{t("name")}</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>{t("email")}</Form.Label>
              <Form.Control
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>
                {t("password")}{" "}
                {editingUser && `(${t("leave_blank_to_keep")})`}
              </Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>{t("phone")}</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="primary">
              {editingUser ? t("update") : t("register")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
