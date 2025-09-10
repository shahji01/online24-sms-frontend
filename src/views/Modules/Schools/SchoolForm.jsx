import React from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const SchoolForm = ({
  show,
  onClose,
  onSubmit,
  loading,
  name,
  setName,
  address,
  setAddress,
  contactNo,
  setContactNo,
  adminEmail,
  setAdminEmail,
  modalType,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = ["ar", "ur"].includes(i18n.language);
  const direction = isRTL ? "rtl" : "ltr";
  const isAddMode = modalType === "add";

  return (
    <Modal show={show} onHide={onClose} backdrop="static" dir={direction}>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isAddMode ? t("add_school") : t("edit_school")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>{t("name")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("enter_name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </Form.Group>

          <Form.Group controlId="address" className="mb-3">
            <Form.Label>{t("address")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("enter_address")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group controlId="contact_no" className="mb-3">
            <Form.Label>{t("contact_no")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("enter_contact_no")}
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          {/* New: Admin email */}
          <Form.Group controlId="admin_email" className="mb-3">
            <Form.Label>{t("admin_email")}</Form.Label>
            <Form.Control
              type="email"
              placeholder={t("enter_admin_email")}
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {isAddMode ? t("adding") : t("updating")}
              </>
            ) : isAddMode ? (
              t("add_school")
            ) : (
              t("update_school")
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SchoolForm;
