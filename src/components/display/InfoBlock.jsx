import React from "react";

import styles from "./InfoBlock.module.css";

function InfoBlock({ title, content, renderItem }) {
  return (
    <div className={styles.wholeField}>
      <div className={styles.title}>{title} :</div>
      <div className={styles.content}>
        {Array.isArray(content) ? (
          <ul className={styles.customList}>
            {content.map((item, index) => (
              <li key={index}>{renderItem ? renderItem(item, index) : item}</li>
            ))}
          </ul>
        ) : React.isValidElement(content) ? (
          content
        ) : typeof content === "string" ? (
          <p className={styles.multilineContent}>
            {content.split(/\r?\n/).map((line, index, array) => (
              <React.Fragment key={index}>
                {line}
                {index < array.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
}

export default InfoBlock;
