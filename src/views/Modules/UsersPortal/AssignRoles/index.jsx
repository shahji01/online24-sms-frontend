import React, { useEffect, useState, useCallback } from 'react';
import axios from '../../../../Utils/axios';
import {
  Table, Modal, Button, Form, Spinner, InputGroup, FormControl
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

const AssignRoles = () => {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchRoles();
      setInitialLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredUsers(users.filter(user =>
      user.name.toLowerCase().includes(lower) ||
      user.email.toLowerCase().includes(lower)
    ));
  }, [searchTerm, users]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.protected.get('/users/get-all-users');
      setUsers(res.data?.data?.data || []);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await axios.protected.get('/roles');
      setRoles(res.data || []);
    } catch (error) {
      console.error('Fetch roles error:', error);
    }
  }, []);

  const openModal = (user) => {
    setSelectedUser(user);
    const assigned = user?.roles?.map(r => ({ value: r.id, label: r.role_name })) || [];
    setSelectedRoles(assigned);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUser || selectedRoles.length === 0) {
      Swal.fire(t('error'), t('please_select_at_least_one_role'), 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.protected.post(`/users/${selectedUser.id}/roles`, {
        roleIds: selectedRoles.map(r => r.value),
      });

      if (response.data.success) {
        Swal.fire(t('success'), response.data.message, 'success');
        fetchUsers();
        closeModal();
      } else {
        throw new Error(response.data.message || t('failed_to_assign_roles'));
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
      [t('roles')]: user.roles?.map(r => r.role_name).join(', ') || '—',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('user_roles'));
    XLSX.writeFile(workbook, 'user_roles.xlsx');
  };

  const roleOptions = roles.map(role => ({ value: role.id, label: role.role_name }));

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>{t('assign_roles_to_users')}</h4>
        <Button variant="success" onClick={exportXLSX}>{t('export_excel')}</Button>
      </div>

      <InputGroup className="mb-3">
        <FormControl
          placeholder={t('search_by_name_or_email')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {initialLoading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th className="text-center">{t('s_no')}</th>
              <th>{t('name')}</th>
              <th>{t('email')}</th>
              <th>{t('roles')}</th>
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
                  <td>{user.roles?.map(r => r.role_name).join(', ') || '—'}</td>
                  <td className="text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openModal(user)}
                    >
                      {t('assign_roles')}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center">{t('no_users_found')}</td></tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} backdrop="static" centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{t('assign_roles')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('user')}</Form.Label>
              <Form.Control type="text" value={selectedUser?.name || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('select_roles')}</Form.Label>
              <Select
                isMulti
                value={selectedRoles}
                onChange={setSelectedRoles}
                options={roleOptions}
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
                  {t('assigning')}
                </>
              ) : t('assign_roles')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignRoles;
