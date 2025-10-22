import React, { useState } from "react";

import styles from "./PasswordField.module.css";
import showIcon from "@images/icons/show.png";
import hideIcon from "@images/icons/hide.png";

function PasswordField({ label, id, placeholder = "", value, onChange, isEnabled=true }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.formRow}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputField}>
        <input
          className={styles.input}
          id={id}
          name={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={!isEnabled}
          required
        />
        <button
          type="button"
          className={styles.sideButton}
          onClick={() => setShow(!show)}
        >
          <img
            src={show ? showIcon : hideIcon}
            alt={show ? "Hide password" : "Show password"}
            className={styles.icon}
          />
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
