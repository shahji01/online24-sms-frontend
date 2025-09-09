import React from 'react';
import { Button } from 'react-bootstrap';
import { FaPrint, FaFileExcel, FaPlus } from 'react-icons/fa';
import PermissionCheck from './PermissionCheck';

const HeaderActionBar = ({
  title,
  onPrint,
  onExport,
  onAdd,
  addPermission = '',
  hideAdd = false,
  extraActions = []
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3 no-print">
      <div className="fw-bold fs-5">&nbsp;</div>

      <div className="d-flex gap-2">
        {onPrint && (
          <Button variant="outline-secondary" onClick={onPrint}>
            <FaPrint className="me-1" /> Print
          </Button>
        )}
        {!hideAdd && onAdd && (
          <PermissionCheck permission={[addPermission]}>
            <Button variant="primary" onClick={onAdd}>
              <FaPlus className="me-1" /> Add {title}
            </Button>
          </PermissionCheck>
        )}
        {onExport && (
          <Button variant="success" onClick={onExport}>
            <FaFileExcel className="me-1" /> Export
          </Button>
        )}
        {extraActions.map(({ label, onClick, color }, i) => (
          <Button key={i} variant={color} onClick={onClick}>{label}</Button>
        ))}
      </div>
    </div>
  );
};

export default HeaderActionBar;
