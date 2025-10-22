import React, { useState, useEffect, useMemo } from "react";

import { Link } from "react-router-dom";

import styles from "./CourseCard.module.css";
import { calculateStudentProgress } from "../studentLesson";
import { getLessonsbyCourseID } from "../getLessons";
import { getCardPalette } from "./cardPalette";

function CourseCard({
  courseID,
  courseTitle,
  creditPoint,
  instructorName,
  href,
  userData,
}) {
  const [progress, setProgress] = useState(0);
  const displayProgress = userData?.role === "student";

  const cardStyle = useMemo(() => {
    const sourceKey = `${courseID || ""}-${courseTitle || ""}`;
    const palette = getCardPalette(sourceKey.trim());
    return {
      "--card-background": palette.background,
      "--card-accent": palette.accent,
      "--card-muted": palette.muted,
    };
  }, [courseID, courseTitle]);

  useEffect(() => {
    if (userData != null && userData?.role === "student") {
      getLessonsbyCourseID(courseID, userData)
        .then((lessons) => {
          const lessonCodes = lessons.map((lesson) => lesson.data().lessonID);

          calculateStudentProgress(userData.id, lessonCodes)
            .then((studentProgress) => {
              setProgress(
                Number.isFinite(studentProgress)
                  ? studentProgress
                  : parseFloat(studentProgress) || 0
              );
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  return (
    <Link to={href}>
      <div className={styles.lessonCard} style={cardStyle}>
        <div className={styles.lessonInfo}>
          <p className={styles.lessonId}>{courseID}</p>
          <p className={styles.lessonTitle}>{courseTitle}</p>
          <p className={styles.lessonCreditPoint}>
            Total Credit Point: {creditPoint}
          </p>
          <p className={styles.lessonInstructor}>{instructorName}</p>
        </div>

        {displayProgress && (
          <div
            className={styles.lessonExtraArea}
            role="progressbar"
            aria-label="Course progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`Course progress ${progress}%`}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

export default CourseCard;
