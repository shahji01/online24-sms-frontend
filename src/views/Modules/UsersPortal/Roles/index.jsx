import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../../../../Utils/axios';
import {
  Table,
  Modal,
  Button,
  Form,
  Spinner,
  Badge,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';

const Roles = () => {
  const { t } = useTranslation();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [form, setForm] = useState({ role_name: '', permissionIds: [] });
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(roles.filter((r) => r.role_name.toLowerCase().includes(term)));
  }, [searchTerm, roles]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await axios.protected.get('roles');
      setRoles(res.data || []);
    } catch (error) {
      Swal.fire(t('error'), t('fetch_roles_failed'), 'error');
    }
  }, [t]);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await axios.protected.get('permissions');
      setPermissions(res.data || []);
    } catch (error) {
      Swal.fire(t('error'), t('fetch_permissions_failed'), 'error');
    }
  }, [t]);

  const openModal = (type, role = null) => {
    setModalType(type);
    setSelectedRole(role);
    setForm({
      role_name: role?.role_name || '',
      permissionIds:
        role?.permissions?.map((p) => ({
          value: p.id,
          label: p.permission_name,
        })) || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ role_name: '', permissionIds: [] });
    setSelectedRole(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.role_name.trim()) {
      return Swal.fire(t('validation_error'), t('role_name_required'), 'warning');
    }

    setLoading(true);
    try {
      const payload = {
        role_name: form.role_name.trim(),
        permissionIds: form.permissionIds.map((opt) => opt.value),
      };

      const endpoint = modalType === 'add' ? 'roles' : `roles/${selectedRole.id}`;
      const method = modalType === 'add' ? 'post' : 'put';

      const response = await axios.protected[method](endpoint, payload);

      if (response.data.success) {
        Swal.fire(t('success'), response.data.message, 'success');
        await fetchRoles();
        closeModal();
      } else {
        throw new Error(response.data.message || t('operation_failed'));
      }
    } catch (error) {
      Swal.fire(t('error'), error.response?.data?.message || error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportXLSX = () => {
    const data = filtered.map((role, i) => ({
      [t('s_no')]: i + 1,
      [t('name')]: role.role_name,
      [t('status')]: role.status === 1 ? t('active') : t('inactive'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('roles'));
    XLSX.writeFile(workbook, 'roles.xlsx');
  };

  const renderStatusBadge = (status) =>
    status === 1 ? (
      <Badge bg="success">{t('active')}</Badge>
    ) : (
      <Badge bg="secondary">{t('inactive')}</Badge>
    );

  const modalTitle = useMemo(
    () => (modalType === 'add' ? t('add_role') : t('edit_role')),
    [modalType, t]
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{t('roles')}</h4>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={exportXLSX}>
            {t('export_excel')}
          </Button>
          <Button variant="primary" onClick={() => openModal('add')}>
            {t('add_role')}
          </Button>
        </div>
      </div>

      <InputGroup className="mb-3">
        <FormControl
          placeholder={t('search_roles')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th className="text-center">{t('s_no')}</th>
            <th className="text-center">{t('name')}</th>
            <th className="text-center">{t('status')}</th>
            <th className="text-center">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((role, index) => (
              <tr key={role.id}>
                <td className="text-center">{index + 1}</td>
                <td>{role.role_name}</td>
                <td className="text-center">{renderStatusBadge(role.status)}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openModal('edit', role)}
                  >
                    {t('edit')}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                {t('no_roles_found')}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} backdrop="static">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('role_name')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_role_name')}
                value={form.role_name}
                onChange={(e) => handleFormChange('role_name', e.target.value)}
                disabled={loading}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('permissions')}</Form.Label>
              <Select
                isMulti
                options={permissions.map((p) => ({
                  value: p.id,
                  label: p.permission_name,
                }))}
                value={form.permissionIds}
                onChange={(selected) => handleFormChange('permissionIds', selected)}
                isDisabled={loading}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {modalType === 'add' ? t('adding') : t('updating')}
                </>
              ) : modalType === 'add' ? t('add_role') : t('update_role')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Roles;
