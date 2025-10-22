import React from "react";

import { Link } from "react-router-dom";

import styles from "./JoinCourseCard.module.css";

function JoinCourseCard({
  courseID,
  courseTitle,
  creditPoint,
  courseSupervisor,
  href,
  onJoin,
}) {
  const handleJoinClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onJoin) {
      onJoin();
    }
  };

  return (
    <Link to={href}>
      <div className={styles.lessonCard}>
        <div className={styles.lessonInfo}>
          <p className={styles.lessonId}>{courseID}</p>
          <p className={styles.lessonTitle}>{courseTitle}</p>
          <p className={styles.lessonCreditPoint}>
            Total Credit Point: {creditPoint}
          </p>
          <p className={styles.lessonInstructor}>{courseSupervisor}</p>
        </div>

        <div className={styles.lessonExtraArea}>
          <button
            type="button"
            onClick={handleJoinClick}
            className={styles.smallButton}
          >
            Join
          </button>
        </div>
      </div>
    </Link>
  );
}

export default JoinCourseCard;
