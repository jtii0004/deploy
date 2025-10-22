import React, { useEffect, useState } from "react";

import { getLessons } from "../components/getLessons";
import { getCourses } from "../components/getCourses";
import { getClassrooms } from "../components/getClassroom";

import styles from "./ReportDashboard.module.css";
import ReportSquare from "../components/display/reportSquare";

const EMPTY_STATS = { total: 0, active: 0, draft: 0, archived: 0, average: 0 };

function normaliseName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function buildInstructorIdentifiers(userData) {
  if (!userData) {
    return new Set();
  }

  const withTitle = normaliseName(
    [userData.title, userData.firstName, userData.lastName]
      .filter((part) => typeof part === "string" && part.trim().length > 0)
      .join(" ")
  );

  const withoutTitle = normaliseName(
    [userData.firstName, userData.lastName]
      .filter((part) => typeof part === "string" && part.trim().length > 0)
      .join(" ")
  );

  const identifiers = [withTitle, withoutTitle].filter(Boolean);

  return new Set(identifiers);
}

function filterDocsByFields(docs, fieldNames, identifierSet) {
  if (!(identifierSet instanceof Set) || identifierSet.size === 0) {
    return [];
  }

  return docs.filter((docSnap) => {
    const data = snapshotData(docSnap);

    return fieldNames.some((fieldName) =>
      identifierSet.has(normaliseName(data?.[fieldName]))
    );
  });
}

function snapshotData(docSnap) {
  return typeof docSnap?.data === "function" ? docSnap.data() : docSnap || {};
}

function calculateLessonStats(snapshots) {
  const total = snapshots.length;
  let active = 0;
  let draft = 0;
  let archived = 0;
  let creditSum = 0;

  snapshots.forEach((docSnap) => {
    const data = snapshotData(docSnap);
    const status =
      typeof data?.status === "string" ? data.status.toLowerCase() : "";

    if (status === "published") {
      active += 1;
    }
    if (status === "draft") {
      draft += 1;
    }
    if (status === "archived") {
      archived += 1;
    }

    const credit = Number(data?.creditPoint);
    if (!Number.isNaN(credit)) {
      creditSum += credit;
    }
  });

  return {
    total,
    active,
    draft,
    archived,
    average: total > 0 ? creditSum / total : 0,
  };
}

function calculateCourseStats(snapshots) {
  const total = snapshots.length;
  let active = 0;
  let draft = 0;
  let archived = 0;
  let creditSum = 0;

  snapshots.forEach((docSnap) => {
    const data = snapshotData(docSnap);
    const status =
      typeof data?.courseStatus === "string"
        ? data.courseStatus.toLowerCase()
        : "";

    if (status === "published") {
      active += 1;
    }
    if (status === "draft") {
      draft += 1;
    }
    if (status === "archived") {
      archived += 1;
    }

    const credit = Number(
      data?.courseTotalCreditpoint ?? data?.courseTotalCreditPoint
    );
    if (!Number.isNaN(credit)) {
      creditSum += credit;
    }
  });

  return {
    total,
    active,
    draft,
    archived,
    average: total > 0 ? creditSum / total : 0,
  };
}

function calculateClassroomStats(snapshots) {
  const total = snapshots.length;
  let active = 0;
  let draft = 0;
  let archived = 0;
  let studentCount = 0;

  snapshots.forEach((docSnap) => {
    const data = snapshotData(docSnap);
    const status =
      typeof data?.classroom_status === "string"
        ? data.classroom_status.toLowerCase()
        : "";

    if (status === "published") {
      active += 1;
    }
    if (status === "draft") {
      draft += 1;
    }
    if (status === "archived") {
      archived += 1;
    }

    const students = Array.isArray(data?.classroom_students)
      ? data.classroom_students.filter(Boolean).length
      : 0;
    studentCount += students;
  });

  return {
    total,
    active,
    draft,
    archived,
    average: total > 0 ? studentCount / total : 0,
  };
}

function formatCount(value, loading) {
  if (loading) {
    return "...";
  }

  return Number.isFinite(value) ? value.toLocaleString() : "0";
}

function formatAverage(value, loading) {
  if (loading) {
    return "...";
  }

  if (!Number.isFinite(value) || value === 0) {
    return "0";
  }

  return value % 1 === 0 ? value.toLocaleString() : value.toFixed(1);
}

function ReportDashboard({ userData }) {
  const [lessonStats, setLessonStats] = useState({ ...EMPTY_STATS });
  const [courseStats, setCourseStats] = useState({ ...EMPTY_STATS });
  const [classroomStats, setClassroomStats] = useState({ ...EMPTY_STATS });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData) {
      setLessonStats({ ...EMPTY_STATS });
      setCourseStats({ ...EMPTY_STATS });
      setClassroomStats({ ...EMPTY_STATS });
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function loadReportData() {
      try {
        const [lessonDocs, courseDocs, classroomDocs] = await Promise.all([
          getLessons(true, userData),
          getCourses(true, userData),
          getClassrooms(true, userData),
        ]);

        if (cancelled) {
          return;
        }

        const isInstructor = userData?.role === "instructor";
        const instructorIdentifiers = isInstructor
          ? buildInstructorIdentifiers(userData)
          : null;
        const hasInstructorIdentifiers =
          instructorIdentifiers && instructorIdentifiers.size > 0;

        const reportLessonDocs =
          isInstructor && hasInstructorIdentifiers
            ? filterDocsByFields(
                lessonDocs,
                ["owner", "lessonOwner"],
                instructorIdentifiers
              )
            : lessonDocs;

        const reportCourseDocs =
          isInstructor && hasInstructorIdentifiers
            ? filterDocsByFields(
                courseDocs,
                ["courseSupervisor", "courseSupervisorName"],
                instructorIdentifiers
              )
            : courseDocs;

        const reportClassroomDocs =
          isInstructor && hasInstructorIdentifiers
            ? filterDocsByFields(
                classroomDocs,
                ["classroom_instructor", "classroomInstructor"],
                instructorIdentifiers
              )
            : classroomDocs;

        setLessonStats(calculateLessonStats(reportLessonDocs));
        setCourseStats(calculateCourseStats(reportCourseDocs));
        setClassroomStats(calculateClassroomStats(reportClassroomDocs));
      } catch (error) {
        console.error("Failed to load report data:", error);
        if (!cancelled) {
          setLessonStats({ ...EMPTY_STATS });
          setCourseStats({ ...EMPTY_STATS });
          setClassroomStats({ ...EMPTY_STATS });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReportData();

    return () => {
      cancelled = true;
    };
  }, [userData]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitleRow}>
          <div className={styles.infoTitle}>Report</div>
        </div>
      </div>
      <div className={styles.infoScroll}>
        <div className={styles.rowContainer}>
          <div className={styles.reportRow}>
            <div className={styles.rowTitle}>Lesson</div>

            <div className={styles.rowContent}>
              <ReportSquare
                title={"Total Lesson"}
                number={formatCount(lessonStats.total, loading)}
                description={"All created lessons"}
              />
              <ReportSquare
                title={"Active Lesson"}
                number={formatCount(lessonStats.active, loading)}
                variant={"active"}
                description={"Current running"}
              />
              <ReportSquare
                title={"Draft Lesson"}
                number={formatCount(lessonStats.draft, loading)}
                variant={"draft"}
                description={"Not yet published"}
              />
              <ReportSquare
                title={"Archive Lesson"}
                number={formatCount(lessonStats.archived, loading)}
                variant={"archived"}
                description={"Inactive"}
              />
              <ReportSquare
                title={"Average No. of Lesson"}
                number={formatAverage(lessonStats.average, loading)}
                description={"per lesson"}
              />
            </div>
          </div>

          <div className={styles.reportRow}>
            <div className={styles.rowTitle}>Course</div>
            <div className={styles.rowContent}>
              <ReportSquare
                title={"Total Course"}
                number={formatCount(courseStats.total, loading)}
                description={"All created courses"}
              />
              <ReportSquare
                title={"Active Course"}
                number={formatCount(courseStats.active, loading)}
                variant={"active"}
                description={"Current running"}
              />
              <ReportSquare
                title={"Draft Course"}
                number={formatCount(courseStats.draft, loading)}
                variant={"draft"}
                description={"Not yet published"}
              />
              <ReportSquare
                title={"Archive Course"}
                number={formatCount(courseStats.archived, loading)}
                variant={"archived"}
                description={"Inactive"}
              />
              <ReportSquare
                title={"Average No. of Credit Point"}
                number={formatAverage(courseStats.average, loading)}
                description={"per course"}
              />
            </div>
          </div>

          <div className={styles.reportRow}>
            <div className={styles.rowTitle}>Classroom</div>
            <div className={styles.rowContent}>
              <ReportSquare
                title={"Total Classroom"}
                number={formatCount(classroomStats.total, loading)}
                description={"All created classroom"}
              />
              <ReportSquare
                title={"Active Classroom"}
                number={formatCount(classroomStats.active, loading)}
                variant={"active"}
                description={"Current running"}
              />
              <ReportSquare
                title={"Draft Classroom"}
                number={formatCount(classroomStats.draft, loading)}
                variant={"draft"}
                description={"Not yet published"}
              />
              <ReportSquare
                title={"Archive Classroom"}
                number={formatCount(classroomStats.archived, loading)}
                variant={"archived"}
                description={"Inactive"}
              />
              <ReportSquare
                title={"Average No. of Students"}
                number={formatAverage(classroomStats.average, loading)}
                description={"per classroom"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDashboard;
