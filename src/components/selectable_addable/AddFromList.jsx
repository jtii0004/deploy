import React from "react";

import styles from "./AddFromList.module.css";

function AddFromList({
  label,
  placeholder,
  prerequisites,
  setPrerequisites,
  prerequisiteOptions,
  isEnabled=true
}) {
  const handleAdd = (e) => {
    const selected = e.target.value;
    console.log(prerequisites);
    console.log(setPrerequisites);
    console.log(prerequisiteOptions);
    if (selected && !prerequisites.includes(selected)) {
      setPrerequisites((prev) => [...prev, selected]);
    }
  };

  const handleDelete = (itemToDelete) => {
    setPrerequisites((prev) => prev.filter((item) => item !== itemToDelete));
  };

  return (
    <div className={styles.wholeFiled}>
      <label className={styles.label}>{label}</label>

      <div className={styles.addingPart}>
        <select onChange={handleAdd} defaultValue="" disabled={!isEnabled}>
          <option value="" disabled>
            {placeholder}
          </option>
          {prerequisiteOptions.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt.split(":")[0].length < 10 ? opt : opt.split(":")[1]}
            </option>
          ))}
        </select>
      </div>

      <ul className={styles.selectedList}>
        {prerequisites.map((prereq, index) => (
          <li key={index} className={styles.selectedItem}>
            {prereq.split(":")[0].length < 10 ? prereq : prereq.split(":")[1]}
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(prereq)}
              disabled={!isEnabled}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddFromList;
