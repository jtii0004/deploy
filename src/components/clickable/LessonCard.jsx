import React, { useMemo } from "react";

import { Link } from "react-router-dom";

import styles from "./LessonCard.module.css";
import lessonIcon from "@images/icons/atom.png";
import { getCardPalette } from "./cardPalette";

function LessonCard({
  lessonID,
  lessonTitle,
  creditPoint,
  instructorName,
  href,
}) {
  const backgroundStyle = useMemo(() => {
    const sourceKey = `${lessonID || ""}-${lessonTitle || ""}`;
    const palette = getCardPalette(sourceKey.trim());
    return {
      "--card-background": palette.background,
      "--card-accent": palette.accent,
      "--card-muted": palette.muted,
    };
  }, [lessonID, lessonTitle]);

  return (
    <Link to={href}>
      <div className={styles.lessonCard} style={backgroundStyle}>
        <div className={styles.lessonIcon}>
          <img src={lessonIcon} alt="Lesson icon" />
        </div>
        <div className={styles.lessonInfo}>
          <p className={styles.lessonId}>{lessonID}</p>
          <p className={styles.lessonTitle}>{lessonTitle}</p>
          <p className={styles.lessonCreditPoint}>
            Credit Point: {creditPoint}
          </p>
          <p className={styles.lessonInstructor}>{instructorName}</p>
        </div>
      </div>
    </Link>
  );
}

export default LessonCard;
