import React from "react";

import styles from "./AuthHeader.module.css";

function AuthHeader() {
  return (
    <header className={styles.authHeader}>
      <span>LearnSphere</span>
    </header>
  );
}

export default AuthHeader;
