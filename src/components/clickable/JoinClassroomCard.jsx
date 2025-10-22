import React from "react";

import { Link } from "react-router-dom";

import styles from "./JoinClassroomCard.module.css";

function JoinClassroomCard({
  classroomId,
  classroomName,
  courseTitle,
  classroomSupervisor,
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
          <p className={styles.lessonId}>{classroomId}</p>
          <p className={styles.lessonTitle}>{classroomName}</p>
          <p className={styles.lessonCreditPoint}>{courseTitle}</p>
          <p className={styles.lessonInstructor}>{classroomSupervisor}</p>
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

export default JoinClassroomCard;
