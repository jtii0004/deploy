import React from "react";

import styles from "./TermsCheckbox.module.css";

function TermsCheckbox({ id = "terms" }) {
  return (
    <div className={styles.termRow}>
      <input type="checkbox" id={id} required />
      <label htmlFor={id}>
        I agree to the <a href="#">Terms and Privacy Policy</a>
      </label>
    </div>
  );
}

export default TermsCheckbox;
