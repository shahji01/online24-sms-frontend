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
import { useTranslation } from 'react-i18next';

const Permissions = () => {
  const { t } = useTranslation();

  const [permissions, setPermissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [permissionName, setPermissionName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFiltered(
      permissions.filter((per) =>
        per.permission_name.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, permissions]);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await axios.protected.get('permissions');
      setPermissions(res.data || []);
    } catch (error) {
      Swal.fire(t('error'), t('fetch_permissions_failed'), 'error');
    }
  }, [t]);

  const openModal = (type, per = null) => {
    setModalType(type);
    setSelectedPermission(per);
    setPermissionName(per?.permission_name || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPermissionName('');
    setSelectedPermission(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!permissionName.trim()) {
      return Swal.fire(t('validation_error'), t('permission_name_required'), 'warning');
    }

    setLoading(true);
    try {
      const payload = { permission_name: permissionName.trim() };
      const endpoint =
        modalType === 'add'
          ? 'permissions'
          : `permissions/${selectedPermission.id}`;
      const method = modalType === 'add' ? 'post' : 'put';

      const response = await axios.protected[method](endpoint, payload);

      if (response.data.success) {
        Swal.fire(t('success'), response.data.message, 'success');
        await fetchPermissions();
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
    const data = filtered.map((per, i) => ({
      [t('s_no')]: i + 1,
      [t('name')]: per.permission_name,
      [t('status')]: per.status === 1 ? t('active') : t('inactive'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('permissions'));
    XLSX.writeFile(workbook, 'permissions.xlsx');
  };

  const renderStatusBadge = (status) =>
    status === 1 ? (
      <Badge bg="success">{t('active')}</Badge>
    ) : (
      <Badge bg="secondary">{t('inactive')}</Badge>
    );

  const renderActionButtons = (per) => (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={() => openModal('edit', per)}
    >
      {t('edit')}
    </Button>
  );

  const modalTitle = useMemo(
    () => (modalType === 'add' ? t('add_permission') : t('edit_permission')),
    [modalType, t]
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{t('permissions')}</h4>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={exportXLSX}>
            {t('export_excel')}
          </Button>
          <Button variant="primary" onClick={() => openModal('add')}>
            {t('add_permission')}
          </Button>
        </div>
      </div>

      <InputGroup className="mb-3">
        <FormControl
          placeholder={t('search_permissions')}
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
            filtered.map((per, index) => (
              <tr key={per.id}>
                <td className="text-center">{index + 1}</td>
                <td>{per.permission_name}</td>
                <td className="text-center">{renderStatusBadge(per.status)}</td>
                <td className="text-center">{renderActionButtons(per)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                {t('no_permissions_found')}
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
            <Form.Group controlId="formPermissionName">
              <Form.Label>{t('permission_name')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('enter_permission_name')}
                value={permissionName}
                onChange={(e) => setPermissionName(e.target.value)}
                disabled={loading}
                autoFocus
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
              ) : modalType === 'add' ? t('add_permission') : t('update_permission')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Permissions;
