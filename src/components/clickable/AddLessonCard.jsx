import React from "react";

import { Link } from "react-router-dom";

import styles from "./AddLessonCard.module.css";
import addIcon from "@images/icons/add.png";

function AddLessonCard({ href }) {
  return (
    <Link to={href}>
      <div className={styles.lessonCard}>
        <div className={styles.lessonIcon}>
          <img src={addIcon} alt="Add lesson" />
        </div>
        <div className={styles.lessonInfo}>
          <p className={styles.lessonTitle}>Add Lesson</p>
        </div>
      </div>
    </Link>
  );
}

export default AddLessonCard;
