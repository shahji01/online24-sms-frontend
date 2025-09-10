import React, { useState } from "react";
import SchoolList from "./SchoolList";
import SchoolHandler from "./SchoolHandler";

const Schools = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (school) => {
    setSelectedSchool(school);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedSchool(null);
  };

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <SchoolList key={refreshKey} onEdit={handleEdit} />
      {modalOpen && (
        <SchoolHandler
          show={modalOpen}
          onClose={handleClose}
          fetchList={triggerRefresh}
          data={selectedSchool}
        />
      )}
    </>
  );
};

export default Schools;
