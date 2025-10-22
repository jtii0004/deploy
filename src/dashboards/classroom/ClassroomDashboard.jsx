import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import {
  getClassrooms,
  getClassroomByStudent,
} from "../../components/getClassroom";

import styles from "./ClassroomDashboard.module.css";

import FilterDropdown from "../../components/selectable_addable/FilterDropdown";
import ClassroomCard from "../../components/clickable/ClassroomCard";
const INSTRUCTOR_MY_CLASSROOMS = "INSTRUCTOR_MY_CLASSROOMS";

function ClassroomDashboard({ userData }) {
  const [filter, setFilter] = useState(true);
  const [label, setLabel] = useState("All Classrooms");
  const [classrooms, setClassrooms] = useState([]);

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
      getClassroomByStudent(userData.id).then((studentClassrooms) => {
        setClassrooms(studentClassrooms);
      });
      return;
    }

    if (filter === INSTRUCTOR_MY_CLASSROOMS) {
      getClassrooms(true, userData).then((allClassrooms) => {
        const filtered = allClassrooms.filter((classroom) => {
          const supervisor = classroom.data().classroom_instructor || "";
          return instructorDisplayName
            ? supervisor.trim().toLowerCase() ===
                instructorDisplayName.trim().toLowerCase()
            : false;
        });
        setClassrooms(filtered);
      });
    } else {
      getClassrooms(filter, userData).then((allClassrooms) => {
        setClassrooms(allClassrooms);
      });
    }
  }, [filter, userData, instructorDisplayName]);

  const instructorOptions = [
    { label: "All Classrooms", state: true },
    { label: "My Classrooms", state: INSTRUCTOR_MY_CLASSROOMS },
    { label: "Draft", state: "Draft" },
    { label: "Published", state: "Published" },
    { label: "Archived", state: "Archived" },
  ];

  const studentOptions = [{ label: "All Classrooms", state: true }];

  const filterOptions =
    userData?.role === "student" ? studentOptions : instructorOptions;

  return (
    <>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitleRow}>
          <div className={styles.infoTitle}>Classrooms</div>
          {userData?.role === "student" && (
            <Link to="/home/joinclassroom" className={styles.actionButton}>
              Join Classroom
            </Link>
          )}
          {userData?.role !== "student" && (
            <Link to="/home/newclassroom" className={styles.actionButton}>
              Create Classroom
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
          {classrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroomId={classroom.data().classroom_id}
              classroomName={classroom.data().classroom_name}
              courseTitle={classroom.data().classroom_course}
              supervisor={classroom.data().classroom_instructor}
              href={`/home/classrooms/${classroom.id}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default ClassroomDashboard;
