import React from "react";
import { useState } from "react";

import styles from "./RegisterPage.module.css";

import RegisterForm from "../forms/RegisterForm";
import RoleSelection from "../components/functional/RoleSelection";
import AuthHeader from "../layout/AuthHeader";

function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState("student");

  return (
    <div className={styles.mainContent}>
      <AuthHeader />

      <div className={styles.pageContent}>
        <RoleSelection
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
        />

        <RegisterForm selectedRole={selectedRole} />
      </div>
    </div>
  );
}

export default RegisterPage;
