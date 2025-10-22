import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./LoginPage.module.css";

import AuthHeader from "../layout/AuthHeader";
import LoginForm from "../forms/LoginForm";
import SingleButtonMessageBox from "../components/display/SingleButtonMessageBox";

function LoginPage() {
  console.log("LoginPage rendered");
  const [showError, setShowError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (errorCount >= 3) {
      navigate("/byebye");
    }
  }, [errorCount, navigate]);

  const handleError = () => {
    setShowError(false);
    setErrorCount((prev) => prev + 1);
  };

  return (
    <div className={styles.mainContent}>
      <AuthHeader />
      <div className={styles.pageContent}>
        <LoginForm showError={showError} setShowError={setShowError} />
      </div>
      {showError && (
        <SingleButtonMessageBox
          label="Error"
          message="Invalid email or password"
          button_1="Try Again"
          onConfirm={handleError}
        />
      )}
    </div>
  );
}

export default LoginPage;
