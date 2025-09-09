import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Form, Button } from "react-bootstrap";
import axios from "../Utils/axios";
import styles from "@/assets/scss/Authentication.module.scss";
import { useStateContext } from "../context/contextProvider";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useStateContext();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456789");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.public.post("auth/admin-login", {
        email,
        password,
      });

      if (res.data.status && res.data.message.includes("Verification")) {
        setTempEmail(email);
        setShow2FAModal(true);
      } else {
        setError("Invalid credentials or unexpected response");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.public.post("auth/verify-code", {
        email: tempEmail,
        code,
      });

      if (res.data.status) {
        const { access_token, user } = res.data.data;
        setToken(access_token);
        setUser(user);
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Invalid verification code");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    }
  };

  return (
    <div className={styles.auth_wrapper}>
      <div className={`${styles.from_container} d-flex justify-content-center align-items-center h-100`}>
        <div className="col-md-10 col-lg-8 col-xl-5">
          <div className={`${styles.card} card rounded-0`}>
            <div className={`${styles.card_header} card-header`}>
              <strong> Welcome !</strong>
            </div>
            <div className={`${styles.card_body} card-body`}>
              <form onSubmit={handleLogin}>
                {error && <div className="text-danger mb-3">{error}</div>}

                <div className={`${styles.input_group} input-group mb-3`}>
                  <span className={`${styles.input_group_icon} input-group-text`}>
                    <i className="fa fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={`${styles.input_group} input-group mb-3`}>
                  <span className={`${styles.input_group_icon} input-group-text`}>
                    <i className="fa fa-asterisk"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button type="submit" className="btn btn-primary w-100">
                    Log In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.logo_container} h-100`}>
        <div className={styles.oblique}></div>
        <div className={styles.logo}>
          <Link to="/">
            <img src="./logoFullColored.png" alt="logo" className="logo" style={{ width: "190px" }} />
          </Link>
        </div>
      </div>

      {/* 2FA Verification Modal */}
      <Modal show={show2FAModal} onHide={() => setShow2FAModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter 2FA Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleVerifyCode}>
            <Form.Group>
              <Form.Label>6-digit Code</Form.Label>
              <Form.Control
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the code sent to your email"
                required
              />
            </Form.Group>
            <Button type="submit" className="mt-3 w-100">
              Verify Code
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Login;
