import React from "react";

import styles from "./InputField.module.css";

function InputField({
  label,
  id,
  type = "text",
  placeholder = "",
  value,
  onChange,
  style = {},
  min,
  isEnabled=true
}) {
  return (
    <div className={styles.formRow} style={style}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.inputField}>
        <input
          className={styles.input}
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          disabled={!isEnabled}
          required
        />
      </div>
    </div>
  );
}

export default InputField;
