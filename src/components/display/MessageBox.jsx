import React from "react";

import styles from "./MessageBox.module.css";

function MessageBox({
  label = "Delete Lesson",
  message = "Are you sure?",
  button_1 = "Cancel",
  button_2 = "Confirm",
  onConfirm,
  onCancel,
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.title}>{label}</div>
        <div className={styles.messageArea}>{message}</div>
        <div className={styles.buttonArea}>
          <button
            className={styles.smallButton}
            style={{ background: "#beb2a4" }}
            onClick={onCancel}
          >
            {button_1}
          </button>
          <button className={styles.smallButton} onClick={onConfirm}>
            {button_2}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageBox;
