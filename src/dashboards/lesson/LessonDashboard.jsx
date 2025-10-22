import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import { getLessons } from "../../components/getLessons";
import { getListOfLessonsFromStudent } from "../../components/studentLesson";

import styles from "./LessonDashboard.module.css";

import FilterDropdown from "../../components/selectable_addable/FilterDropdown";
import LessonCard from "../../components/clickable/LessonCard";

const INSTRUCTOR_MY_LESSONS = "INSTRUCTOR_MY_LESSONS";

function LessonDashboard({ userData }) {
  const [filter, setFilter] = useState(true);
  const [label, setLabel] = useState("All Lessons");
  const [lessons, setLessons] = useState([]);

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

  useEffect(() => {
    if (!userData) {
      setLessons([]);
      return;
    }

    let cancelled = false;

    async function loadLessons() {
      try {
        let fetchedLessons = [];

        if (userData.role === "student") {
          fetchedLessons = await getListOfLessonsFromStudent(userData.id);
        } else if (filter === INSTRUCTOR_MY_LESSONS) {
          if (!instructorDisplayName) {
            setLessons([]);
            return;
          }
          fetchedLessons = await getLessons(true, userData, {
            ownerName: instructorDisplayName,
          });
        } else {
          fetchedLessons = await getLessons(filter, userData);
        }

        if (!cancelled) {
          setLessons(fetchedLessons);
        }
      } catch (error) {
        console.error("Failed to load lessons:", error);
        if (!cancelled) {
          setLessons([]);
        }
      }
    }

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [filter, userData, instructorDisplayName]);

  const changeEvent = (event, state) => {
    event.preventDefault();
    setFilter(state);
    setLabel(event.target.text);
  };

  const instructorOptions = [
    { label: "All Lessons", state: true },
    { label: "My Lessons", state: INSTRUCTOR_MY_LESSONS },
    { label: "Draft", state: "Draft" },
    { label: "Published", state: "Published" },
    { label: "Archived", state: "Archived" },
  ];

  const studentOptions = [{ label: "All Lessons", state: true }];

  const filterOptions =
    userData?.role === "student" ? studentOptions : instructorOptions;

  return (
    <>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitleRow}>
          <div className={styles.infoTitle}>Lessons</div>
          {userData?.role !== "student" && (
            <Link to="/home/newlesson" className={styles.actionButton}>
              Add Lesson
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
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lessonID={lesson.data().lessonID}
              lessonTitle={lesson.data().title}
              creditPoint={lesson.data().creditPoint}
              instructorName={lesson.data().owner}
              href={`/home/lessons/${lesson.id}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default LessonDashboard;
