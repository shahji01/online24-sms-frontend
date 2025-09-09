export const printRefContent = (ref) => {
  if (!ref?.current) return;
  const printContent = ref.current.innerHTML;
  const originalContent = document.body.innerHTML;
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload();
};
