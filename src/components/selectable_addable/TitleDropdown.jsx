import React from "react";

import styles from "./TitleDropdown.module.css";

function TitleDropdown({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Please select…",
  isEnabled=true
}) {
  return (
    <div className={styles.formRow}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <select
        className={styles.select}
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={!isEnabled}
      >
        <option className={styles.option} value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TitleDropdown;
