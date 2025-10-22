import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import { getCourses, getCoursesByStudent } from "../../components/getCourses";
import { getListOfCoursesFromStudent } from "../../components/getStudentCourse";

import styles from "./CourseDashboard.module.css";

import FilterDropdown from "../../components/selectable_addable/FilterDropdown";
import CourseCard from "../../components/clickable/CourseCard";

const INSTRUCTOR_MY_COURSES = "INSTRUCTOR_MY_COURSES";

function CourseDashboard({ userData }) {
  const [filter, setFilter] = useState(true);
  const [label, setLabel] = useState("All Courses");
  const [courses, setCourses] = useState([]);

  const instructorDisplayName = useMemo(() => {
    if (!userData || userData.role === "student") {
      return "";
    }

    const parts = [
      userData.title,
      userData.firstName,
      userData.lastName,
    ].filter(Boolean);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }, [userData]);

  const changeEvent = (event, state) => {
    setFilter(state);
    setLabel(event.target.text);
  };

  useEffect(() => {
    if (!userData) {
      return;
    }

    if (userData.role === "student") {
      getListOfCoursesFromStudent(userData.id).then((studentCourses) => {
        setCourses(studentCourses);
      });
      return;
    }

    if (filter === INSTRUCTOR_MY_COURSES) {
      getCourses(true, userData).then((allCourses) => {
        const filtered = allCourses.filter((course) => {
          const supervisor = course.data().courseSupervisor || "";
          return instructorDisplayName
            ? supervisor.trim().toLowerCase() ===
                instructorDisplayName.trim().toLowerCase()
            : false;
        });
        setCourses(filtered);
      });
    } else {
      getCourses(filter, userData).then((allCourses) => {
        setCourses(allCourses);
      });
    }
  }, [filter, userData, instructorDisplayName]);

  const instructorOptions = [
    { label: "All Courses", state: true },
    { label: "My Courses", state: INSTRUCTOR_MY_COURSES },
    { label: "Draft", state: "Draft" },
    { label: "Published", state: "Published" },
    { label: "Archived", state: "Archived" },
  ];

  const studentOptions = [{ label: "All Courses", state: true }];

  const filterOptions =
    userData?.role === "student" ? studentOptions : instructorOptions;

  return (
    <>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitleRow}>
          <div className={styles.infoTitle}>Courses</div>
          {userData?.role === "student" && (
            <Link to="/home/joincourse" className={styles.actionButton}>
              Join Course
            </Link>
          )}
          {userData?.role !== "student" && (
            <Link to="/home/newcourse" className={styles.actionButton}>
              Add Course
            </Link>
          )}
        </div>
        {userData && (
          <FilterDropdown
            label={label}
            options={filterOptions}
            changeEvent={changeEvent}
          />
        )}
      </div>
      <div className={styles.infoScroll}>
        <div className={styles.cardContainer}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              courseID={course.data().courseID}
              courseTitle={course.data().courseTitle}
              creditPoint={course.data().courseTotalCreditpoint}
              instructorName={course.data().courseSupervisor}
              href={`/home/courses/${course.id}`}
              userData={userData}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default CourseDashboard;
