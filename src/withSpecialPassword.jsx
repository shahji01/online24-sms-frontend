import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const SPECIAL_PASSWORD = '123@***abc***@123'; // 🔐 your hardcoded password here
const SESSION_KEY = 'validated_database_tables_access';

const withSpecialPassword = (WrappedComponent) => {
  return (props) => {
    const [isValidated, setIsValidated] = useState(() => {
      return sessionStorage.getItem(SESSION_KEY) === 'false';
    });

    useEffect(() => {
      if (!isValidated) {
        requestPassword();
      }
    }, [isValidated]);

    const requestPassword = async () => {
      const { value: password } = await Swal.fire({
        title: 'Protected Area',
        input: 'password',
        inputLabel: 'Enter special password',
        inputPlaceholder: '••••••',
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off',
        },
        showCancelButton: true,
        allowOutsideClick: false,
      });

      if (!password) return;

      if (password === SPECIAL_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        Swal.fire('Access granted', '', 'success');
        setIsValidated(true);
      } else {
        Swal.fire('Access denied', 'Incorrect password.', 'error').then(() => {
          requestPassword(); // Retry
        });
      }
    };

    if (!isValidated) {
      return (
        <div className="text-center py-5">
          <p>Checking access...</p>
          <div className="spinner-border text-primary" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withSpecialPassword;
