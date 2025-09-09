import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { updateRecord } from "./TableService";
import Swal from "sweetalert2";

const RecordEditor = ({ record, tableName, onSave, onCancel }) => {
  const [editedRecord, setEditedRecord] = useState(record);

  const handleChange = (key, value) =>
    setEditedRecord((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      const { data } = await updateRecord(tableName, { record: editedRecord });
      if (data.success) {
        Swal.fire("Success", "Record updated", "success");
        onSave();
      } else {
        Swal.fire("Error", "Update failed", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <tr>
      {Object.entries(editedRecord).map(([key, value], idx) => (
        <td key={idx}>
          <Form.Control
            type="text"
            value={value ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </td>
      ))}
      <td>
        <Button size="sm" variant="success" onClick={handleSave} className="me-2">
          Save
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </td>
    </tr>
  );
};

export default RecordEditor;
