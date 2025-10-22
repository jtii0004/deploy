import React, {useState, useEffect} from "react";

import styles from "./MarkStudentModal.module.css";
import { getStudentLesson } from "../studentLesson";

const actionLabels = {
  pass: "Pass",
  fail: "Fail",
  unmark: "Unmark",
};

function MarkStudentModal({
  student,
  lessons = [],
  onClose,
  onSelectAction,
}) {
  const handleActionClick = (lesson, action) => {
    if (typeof onSelectAction === "function") {
      onSelectAction(lesson, action);
    }
  };

  const resolvedLessons = Array.isArray(lessons) ? lessons : [];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {student ? `Mark for ${student.name}` : "Mark Student"}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close mark popup"
          >
            Close
          </button>
        </header>
        <div className={styles.content}>
          {resolvedLessons.length > 0 ? (
            <div className={styles.lessonList}>
              {resolvedLessons.map((lesson) => {
                const lessonData =
                  lesson && typeof lesson.data === "function"
                    ? lesson.data()
                    : lesson ?? {};
                const lessonTitle =
                  lessonData?.title ??
                  lessonData?.lessonTitle ??
                  lesson?.id ??
                  "Lesson";
                const lessonKey = lesson?.id ?? lessonTitle;

                return (
                  <div className={styles.lessonRow} key={lessonKey}>
                    <span className={styles.lessonName}>{lessonTitle}</span>
                    <div className={styles.actionButtons}>
                      {Object.entries(actionLabels).map(([action, label]) => (
                        <button
                          type="button"
                          key={action}
                          className={`${styles.actionButton} ${styles[action]}`}
                          onClick={() => handleActionClick(lesson, action)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyState}>
              This classroom does not contain any lessons yet.
            </p>
          )}
        </div>
        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}

export default MarkStudentModal;
