import React from "react";

import styles from "./SingleButtonMessageBox.module.css";

function SingleButtonMessageBox({
  label = "Notification",
  message,
  button = "OK",
  onConfirm,
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
            onClick={onConfirm}
          >
            {button}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleButtonMessageBox;
