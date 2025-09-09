import axios from "../../../Utils/axios";

export const fetchTables = () => axios.protected.get("database/tables");

export const truncateTables = (tables) =>
  axios.protected.delete("database/truncate-selected", { data: { tables } });

export const fetchTableRecords = (tableName) =>
  axios.protected.get(`database/table-records/${tableName}`);

export const deleteRecords = (tableName, payload) =>
  axios.protected.post(`database/delete-records/${tableName}`, payload);

export const updateRecord = (tableName, payload) =>
  axios.protected.put(`database/update-record/${tableName}`, payload);

export const importSQL = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.protected.post("database/import-sql", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const importTableData = (tableName, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.protected.post(`database/import-table/${tableName}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
