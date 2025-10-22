import React from "react";

import styles from "./ReportSquare.module.css";

const VARIANT_MAP = {
  active: "squareActive",
  draft: "squareDraft",
  archived: "squareArchived",
};

function ReportSquare({ title, number, description, variant }) {
  const variantKey = variant ? VARIANT_MAP[variant] : "";
  const variantClass = variantKey ? styles[variantKey] : "";

  return (
    <div
      className={[styles.square, variantClass].filter(Boolean).join(" ")}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.number}>{number}</div>
      <div className={styles.description}>{description}</div>
    </div>
  );
}

export default ReportSquare;
