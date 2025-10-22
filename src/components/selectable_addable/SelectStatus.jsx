import React from "react";

import styles from "./SelectStatus.module.css";

function SelectStatus({ label, object, name, onChange, isEnabled=true }) {
  return (
    <div className={styles.wholeFiled}>
      <label className={styles.label}>{label}</label>

      <div className={styles.selectingPart}>
        <select name={name} value={object[name]} onChange={onChange} disabled={!isEnabled}>
          <option value=""></option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
      </div>
    </div>
  );
}

export default SelectStatus;
