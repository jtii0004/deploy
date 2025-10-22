import React from "react";

import styles from "./Button.module.css";

function Button({ label, type = "button", onClick }) {
  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {label}
    </button>
  );
}

export default Button;
