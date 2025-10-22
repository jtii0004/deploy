import React from "react";

import styles from "./ErrorMessage.module.css";

function ErrorMessage({ messages }) {
  if (!messages || messages.length === 0) return null;

  return (
    <div className={styles.errorBox}>
      {messages.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
    </div>
  );
}
export default ErrorMessage;
