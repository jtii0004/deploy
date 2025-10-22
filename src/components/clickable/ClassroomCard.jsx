import React, { useMemo } from "react";

import { Link } from "react-router-dom";

import styles from "./ClassroomCard.module.css";
import { getCardPalette } from "./cardPalette";

function ClassroomCard({
  classroomId,
  classroomName,
  courseTitle,
  supervisor,
  href,
}) {
  const cardStyle = useMemo(() => {
    const sourceKey = `${classroomId || ""}-${classroomName || ""}`;
    const palette = getCardPalette(sourceKey.trim());
    return {
      "--card-background": palette.background,
      "--card-accent": palette.accent,
      "--card-muted": palette.muted,
    };
  }, [classroomId, classroomName]);

  return (
    <Link to={href}>
      <div className={styles.card} style={cardStyle}>
        <div className={styles.lessonInfo}>
          <p className={styles.lessonId}>{classroomId}</p>
          <p className={styles.lessonTitle}>{classroomName}</p>
          <p className={styles.lessonCreditPoint}>{courseTitle}</p>
          <p className={styles.lessonInstructor}>{supervisor}</p>
        </div>

        <div className={styles.lessonExtraArea} />
      </div>
    </Link>
  );
}

export default ClassroomCard;
