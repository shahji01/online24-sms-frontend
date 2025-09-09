import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../../../Utils/axios';
import {
  Table, Modal, Button, Form, Spinner, InputGroup, FormControl,
} from 'react-bootstrap';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const AssignPermissions = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.protected.get('/users/get-all-users');
      setUsers(res.data?.data?.data || []);
    } catch (error) {
      Swal.fire(t('error'), t('fetch_error_title'), 'error');
    }
  }, [t]);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await axios.protected.get('/permissions');
      setPermissions(res.data || []);
    } catch (error) {
      Swal.fire(t('error'), t('fetch_permissions_failed'), 'error');
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, [fetchUsers, fetchPermissions]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(user =>
        user.name.toLowerCase().includes(lower) ||
        user.email.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, users]);

  const openModal = (user) => {
    setSelectedUser(user);
    setSelectedPermissions(
      user?.permissions?.map(p => ({ value: p.id, label: p.permission_name })) || []
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedPermissions([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!selectedUser || selectedPermissions.length === 0) {
      Swal.fire(t('error'), t('select_at_least_one_permission'), 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.protected.post(`/users/${selectedUser.id}/permissions`, {
        permissionIds: selectedPermissions.map(p => p.value),
      });

      if (res.data.success) {
        Swal.fire(t('success'), res.data.message, 'success');
        fetchUsers();
        setTimeout(closeModal, 800);
      } else {
        throw new Error(res.data.message || t('assign_failed'));
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      Swal.fire(t('error'), msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportXLSX = () => {
    const data = filteredUsers.map((user, i) => ({
      [t('s_no')]: i + 1,
      [t('name')]: user.name,
      [t('email')]: user.email,
      [t('permissions')]: user.permissions?.map(p => p.permission_name).join(', ') || '—',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'UserPermissions');
    XLSX.writeFile(workbook, 'user_permissions.xlsx');
  };

  const permissionOptions = permissions.map(p => ({
    value: p.id,
    label: p.permission_name,
  }));

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>{t('assign_permissions_to_users')}</h4>
        <Button variant="success" onClick={exportXLSX}>
          {t('export_excel')}
        </Button>
      </div>

      <InputGroup className="mb-3">
        <FormControl
          placeholder={t('search_by_name_or_email')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th className="text-center">{t('s_no')}</th>
            <th>{t('name')}</th>
            <th>{t('email')}</th>
            <th>{t('permissions')}</th>
            <th className="text-center">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td className="text-center">{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.permissions?.map(p => p.permission_name).join(', ') || '—'}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openModal(user)}
                  >
                    {t('assign_permissions')}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                {t('no_users_found')}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={closeModal} backdrop="static" size="lg">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{t('assign_permissions')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('user')}</Form.Label>
              <Form.Control type="text" value={selectedUser?.name || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('select_permissions')}</Form.Label>
              <Select
                options={permissionOptions}
                value={selectedPermissions}
                onChange={setSelectedPermissions}
                isMulti
                isDisabled={loading}
                classNamePrefix="react-select"
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
                  {t('assigning')}
                </>
              ) : t('assign_permissions')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignPermissions;
